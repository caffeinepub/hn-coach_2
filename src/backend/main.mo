import Iter "mo:core/Iter";
import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
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

  type SenderRole = {
    #user;
    #coach;
  };

  type MessageType = {
    #text;
    #image;
    #file;
  };

  type Message = {
    senderRole : SenderRole;
    message : Text;
    messageType : MessageType;
    blobId : ?Text;
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

  type PointReason = {
    #weightImage;
    #footsteps;
    #dailyBonus;
    #custom;
  };

  type PointRecord = {
    points : Nat;
    reason : PointReason;
    remark : Text;
    timestamp : Int;
  };

  type StreakInfo = {
    currentStreak : Nat;
    nextMilestone : Nat;
    daysToNext : Nat;
  };

  // STORAGE -------------------------------------------------------------------

  let profileStore = Map.empty<Principal, UserProfile>();
  let chatStore = Map.empty<Principal, MessageHistory>();
  let bookingStore = Map.empty<Nat, Booking>();
  let lastReadTimestamps = Map.empty<Principal, Int>();
  let pointsStore = Map.empty<Principal, List.List<PointRecord>>();
  // Stores active day numbers (nanoseconds / 86400_000_000_000) per user
  let streakStore = Map.empty<Principal, List.List<Int>>();
  var nextBookingId = 1;

  // CONSTANTS -----------------------------------------------------------------

  // Hourly slots from 6am to 10pm (last slot starts at 22:00)
  let timeSlots = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

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

  // USER PROFILES -------------------------------------------------------------

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
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

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    profileStore.get(user);
  };

  public query ({ caller }) func getAllProfiles() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can fetch all profiles");
    };
    profileStore.values().toArray();
  };

  // CHAT MESSAGES -------------------------------------------------------------

  public shared ({ caller }) func sendMessageToCoach(message : Text, messageType : MessageType, blobId : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    sendMessageInternal(caller, #user, message, messageType, blobId);
  };

  // Admin/coach sends message to a user - no auth check, protected by frontend password
  public shared func sendMessageToUser(user : Principal, message : Text, messageType : MessageType, blobId : ?Text) : async () {
    sendMessageInternal(user, #coach, message, messageType, blobId);
  };

  func sendMessageInternal(user : Principal, role : SenderRole, message : Text, messageType : MessageType, blobId : ?Text) {
    let newMessage : Message = {
      senderRole = role;
      message;
      messageType;
      blobId;
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

  // Returns message history for a user - accessible by admin (no auth check, protected by frontend)
  public query func getUserMessageHistory(user : Principal) : async [Message] {
    let history = switch (chatStore.get(user)) {
      case (null) { List.empty<Message>() };
      case (?history) { history };
    };
    history.toArray().sort();
  };

  // READ RECEIPTS -------------------------------------------------------------

  // Called by the user when they open/view the chat - marks all messages as read
  public shared ({ caller }) func markMessagesAsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };
    lastReadTimestamps.add(caller, Time.now());
  };

  // Returns the timestamp when a user last read their messages
  // No auth check - admin needs to call this to show tick status
  public query func getLastReadTimestamp(user : Principal) : async ?Int {
    lastReadTimestamps.get(user);
  };

  // CHAT ADMIN FUNCTIONS - no auth checks, protected by frontend password gate

  public query func getAllUsers() : async [Principal] {
    chatStore.keys().toArray();
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

  public query func getAvailableTimeSlots(date : Text) : async [(Text, Bool)] {
    let bookingsOnDate = bookingStore.values().toArray().filter(
      func(b) { b.date == date and b.status == #booked }
    );

    timeSlots.map(
      func(slot) {
        let isBooked = bookingsOnDate.any(
          func(b) { b.timeSlot == slot }
        );
        (slot, not isBooked); // true = available (not booked)
      }
    );
  };

  public query func getBookingsByDate(date : Text) : async [Booking] {
    bookingStore.values().toArray().filter(
      func(b) { b.date == date }
    );
  };

  // ADMIN/COACH FUNCTIONS - no auth checks, protected by frontend password gate

  public query func getAllBookingsByUser(user : Principal) : async [Booking] {
    bookingStore.values().toArray().filter(
      func(b) { b.user == user }
    );
  };

  public query func getAllBookings() : async [Booking] {
    bookingStore.values().toArray();
  };

  public shared func adminCancelBooking(bookingId : Nat) : async () {
    switch (bookingStore.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
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

  public shared func cancelAllBookingsForUser(user : Principal) : async () {
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

  public query func getAllBookingsForDate(date : Text) : async [Booking] {
    bookingStore.values().toArray().filter(
      func(b) { b.date == date }
    );
  };

  // POINTS SYSTEM - no auth checks on admin functions, protected by frontend password

  // Admin gives points to a user. Returns new total.
  public shared func givePoints(user : Principal, points : Nat, reason : PointReason, remark : Text) : async Nat {
    let pointRecord : PointRecord = {
      points;
      reason;
      remark;
      timestamp = Time.now();
    };

    let history = switch (pointsStore.get(user)) {
      case (null) { List.fromArray<PointRecord>([pointRecord]) };
      case (?existing) {
        existing.add(pointRecord);
        existing;
      };
    };

    pointsStore.add(user, history);
    getUserPointsInternal(user);
  };

  public query func getUserPointHistory(user : Principal) : async [PointRecord] {
    switch (pointsStore.get(user)) {
      case (null) { [] };
      case (?history) { history.toArray() };
    };
  };

  // Returns total points for a user. No auth - admin can call without login.
  public query func getUserPoints(user : Principal) : async Nat {
    getUserPointsInternal(user);
  };

  // Returns total points for the authenticated caller (user-facing).
  public query ({ caller }) func getCallerPoints() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch their points");
    };
    getUserPointsInternal(caller);
  };

  // Returns full point history for the authenticated caller (user-facing).
  public query ({ caller }) func getCallerPointHistory() : async [PointRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch their point history");
    };
    switch (pointsStore.get(caller)) {
      case (null) { [] };
      case (?history) { history.toArray() };
    };
  };

  func getUserPointsInternal(user : Principal) : Nat {
    switch (pointsStore.get(user)) {
      case (null) { 0 };
      case (?history) {
        var total = 0;
        for (record in history.toArray().vals()) {
          total += record.points;
        };
        total;
      };
    };
  };

  // STREAK SYSTEM -------------------------------------------------------------

  // Nanoseconds per day
  let nanoPerDay : Int = 86_400_000_000_000;

  // Helper: compute day number from nanosecond timestamp
  func toDayNumber(ts : Int) : Int {
    ts / nanoPerDay;
  };

  // Mark today as an active day for the caller (idempotent).
  public shared ({ caller }) func recordActivity() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record activity");
    };
    let todayNum = toDayNumber(Time.now());
    let existing = switch (streakStore.get(caller)) {
      case (null) { List.fromArray<Int>([]) };
      case (?days) { days };
    };
    // Only add if today is not already recorded
    var alreadyRecorded = false;
    for (d in existing.toArray().vals()) {
      if (d == todayNum) { alreadyRecorded := true };
    };
    if (not alreadyRecorded) {
      existing.add(todayNum);
      streakStore.add(caller, existing);
    };
  };

  // Returns streak info for the authenticated caller.
  public query ({ caller }) func getCallerStreak() : async StreakInfo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch their streak");
    };
    computeStreak(caller);
  };

  func computeStreak(user : Principal) : StreakInfo {
    let days = switch (streakStore.get(user)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };

    if (days.size() == 0) {
      return { currentStreak = 0; nextMilestone = 7; daysToNext = 7 };
    };

    // Sort descending
    let sorted = days.sort(func(a : Int, b : Int) : Order.Order { Int.compare(b, a) });
    let todayNum = toDayNumber(Time.now());

    // Count streak going backward from today or yesterday
    var streak : Nat = 0;
    var expected = todayNum;
    var counting = true;

    // Allow starting from yesterday if user hasn't logged today yet
    if (sorted[0] == todayNum - 1) {
      expected := todayNum - 1;
    } else if (sorted[0] == todayNum) {
      expected := todayNum;
    } else {
      // Streak is broken (last active day was before yesterday)
      return { currentStreak = 0; nextMilestone = 7; daysToNext = 7 };
    };

    for (day in sorted.vals()) {
      if (counting) {
        if (day == expected) {
          streak += 1;
          expected := expected - 1;
        } else {
          counting := false;
        };
      };
    };

    // Find the next milestone (first one strictly greater than current streak)
    let milestones : [Nat] = [7, 14, 21, 28];
    var nextMilestone : Nat = 28;
    var daysToNext : Nat = 0;
    var found = false;
    for (m in milestones.vals()) {
      if (not found and streak < m) {
        nextMilestone := m;
        daysToNext := m - streak;
        found := true;
      };
    };

    { currentStreak = streak; nextMilestone; daysToNext };
  };
};

