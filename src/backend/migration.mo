import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
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
    timestamp : Int;
  };

  type OldActor = {
    profileStore : Map.Map<Principal, UserProfile>;
    chatStore : Map.Map<Principal, MessageHistory>;
    bookingStore : Map.Map<Nat, Booking>;
    lastReadTimestamps : Map.Map<Principal, Int>;
    nextBookingId : Nat;
  };

  type NewActor = {
    profileStore : Map.Map<Principal, UserProfile>;
    chatStore : Map.Map<Principal, MessageHistory>;
    bookingStore : Map.Map<Nat, Booking>;
    lastReadTimestamps : Map.Map<Principal, Int>;
    nextBookingId : Nat;
    pointsStore : Map.Map<Principal, List.List<PointRecord>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      profileStore = old.profileStore;
      chatStore = old.chatStore;
      bookingStore = old.bookingStore;
      lastReadTimestamps = old.lastReadTimestamps;
      nextBookingId = old.nextBookingId;
      pointsStore = Map.empty<Principal, List.List<PointRecord>>();
    };
  };
};
