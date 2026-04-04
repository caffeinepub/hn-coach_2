import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // TYPE DEFINITIONS ----------------------------------------------------------

  type UserProfile = {
    name : Text;
    age : Nat;
    whatsAppNumber : Text;
    email : Text;
    weight : Text;
    height : Text;
    targetGoal : Text;
    avatarBlobId : ?Text;
  };

  type Message = {
    senderRole : SenderRole;
    message : Text;
    timestamp : Int;
  };

  type MessageHistory = List.List<Message>;

  type Booking = {
    id : Nat;
    user : Principal;
    date : Text;
    timeSlot : Text;
    status : BookingStatus;
    timestamp : Int;
  };

  type BookingStatus = {
    #booked;
    #cancelled;
  };

  type SenderRole = {
    #user;
    #coach;
  };

  // COMPARISON MODULES --------------------------------------------------------

  module Booking {
    public func compare(booking1 : Booking, booking2 : Booking) : Order.Order {
      switch (Text.compare(booking1.date, booking2.date)) {
        case (#equal) { Text.compare(booking1.timeSlot, booking2.timeSlot) };
        case (order) { order };
      };
    };
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  module TimeSlot {
    public func compare(_ : Text, _ : Text) : Order.Order {
      #equal;
    };
  };

  // STORAGE -------------------------------------------------------------------

  let profileStore = Map.empty<Principal, UserProfile>();
  let chatStore = Map.empty<Principal, MessageHistory>();
  let bookingStore = Map.empty<Nat, Booking>();
  var nextBookingId = 1;

  let timeSlots = [
    "09:00",
    "09:40",
    "10:20",
    "11:00",
    "11:40",
    "12:20",
    "13:00",
    "13:40",
    "14:20",
    "15:00",
    "15:40",
    "16:20",
    "17:00",
  ];

  // USER PROFILES -------------------------------------------------------------

  public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profileStore.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch profiles");
    };
    profileStore.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profileStore.get(user);
  };

  public query ({ caller }) func getAllProfiles() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch all profiles");
    };
    profileStore.values().toArray();
  };

  // CHAT MESSAGES -------------------------------------------------------------
  public shared ({ caller }) func sendMessageToCoach(message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    sendMessageInternal(caller, #user, message);
  };

  public shared ({ caller }) func sendMessageToUser(user : Principal, message : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins/coaches can send messages to users");
    };
    sendMessageInternal(user, #coach, message);
  };

  func sendMessageInternal(user : Principal, role : SenderRole, message : Text) {
    let newMessage : Message = {
      senderRole = role;
      message;
      timestamp = Time.now();
    };

    let entry = chatStore.get(user);
    let history = switch (entry) {
      case (null) { List.fromArray<Message>([newMessage]) };
      case (?history) {
        history.add(newMessage);
        history;
      };
    };

    chatStore.add(user, history);
  };

  public query ({ caller }) func getMessageHistory() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch message history");
    };
    let history = switch (chatStore.get(caller)) {
      case (null) { List.empty<Message>() };
      case (?history) { history };
    };
    history.toArray().sort();
  };

  public query ({ caller }) func getUserMessageHistory(user : Principal) : async [Message] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own messages");
    };
    let history = switch (chatStore.get(user)) {
      case (null) { List.empty<Message>() };
      case (?history) { history };
    };
    history.toArray().sort();
  };

  // APPOINTMENT SCHEDULING ----------------------------------------------------

  public shared ({ caller }) func bookAppointment(date : Text, timeSlot : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book appointments");
    };

    // Validate time slot
    let isValidTimeSlot = timeSlots.any(func(slot) { slot == timeSlot });
    if (not isValidTimeSlot) {
      Runtime.trap("Invalid time slot");
    };

    // Check for duplicate bookings
    let conflictingBooking = bookingStore.values().toArray().find(
      func(b) { b.user == caller and b.date == date and b.timeSlot == timeSlot and b.status == #booked }
    );
    switch (conflictingBooking) {
      case (?_booking) { Runtime.trap("You have already booked this time slot") };
      case (null) {};
    };

    // Create and store new booking
    let bookingId = nextBookingId;
    nextBookingId += 1;

    let newBooking : Booking = {
      id = bookingId;
      user = caller;
      date;
      timeSlot;
      status = #booked;
      timestamp = Time.now();
    };

    bookingStore.add(bookingId, newBooking);
    bookingId;
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };

    switch (bookingStore.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (booking.user != caller) {
          Runtime.trap("Unauthorized: You can only cancel your own bookings");
        };
        if (booking.status == #cancelled) {
          Runtime.trap("Booking is already cancelled");
        };

        let updatedBooking : Booking = {
          id = booking.id;
          user = booking.user;
          date = booking.date;
          timeSlot = booking.timeSlot;
          status = #cancelled;
          timestamp = Time.now();
        };

        bookingStore.add(bookingId, updatedBooking);
      };
    };
  };

  public query ({ caller }) func getUserBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch their bookings");
    };
    bookingStore.values().toArray().filter(func(b) { b.user == caller }).sort();
  };

  public query ({ caller }) func getAvailableTimeSlots(date : Text) : async [(Text, Bool)] {
    // Public function - no authorization required, anyone can check availability
    let bookingsOnDate = bookingStore.values().toArray().filter(
      func(b) { b.date == date and b.status == #booked }
    );

    timeSlots.map(
      func(slot) {
        let isBooked = bookingsOnDate.any(
          func(b) { b.timeSlot == slot }
        );
        (slot, isBooked);
      }
    );
  };

  public query ({ caller }) func getBookingsByDate(date : Text) : async [Booking] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch all bookings for a date");
    };
    bookingStore.values().toArray().filter(
      func(b) { b.date == date }
    );
  };

  // ADMIN/COACH FUNCTIONS -----------------------------------------------------

  public query ({ caller }) func getAllBookingsByUser(user : Principal) : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only coaches can fetch all bookings");
    };
    bookingStore.values().toArray().filter(func(b) { b.user == user }).sort();
  };

  public shared ({ caller }) func cancelAllBookingsForUser(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only coaches can cancel all bookings for a user");
    };

    for ((id, booking) in bookingStore.entries()) {
      if (booking.user == user and booking.status == #booked) {
        let updatedBooking : Booking = {
          id = booking.id;
          user = booking.user;
          date = booking.date;
          timeSlot = booking.timeSlot;
          status = #cancelled;
          timestamp = Time.now();
        };
        bookingStore.add(id, updatedBooking);
      };
    };
  };

  public query ({ caller }) func getAllBookingsForDate(date : Text) : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only coaches can fetch all bookings for a date");
    };
    bookingStore.values().toArray().filter(
      func(b) { b.date == date }
    );
  };
};
