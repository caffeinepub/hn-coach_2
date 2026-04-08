// Migration module: drops accessControlState, timeSlots, and nanoPerDay
// from the previous version which had the authorization extension.
import Map "mo:core/Map";
import List "mo:core/List";

module {
  // ── Old types (copied inline from .old/src/backend — sandbox paths not resolvable) ──

  type OldUserRole = { #admin; #guest; #user };

  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, OldUserRole>;
  };

  type OldBookingStatus = { #booked; #cancelled };

  type OldBooking = {
    date : Text;
    id : Nat;
    status : OldBookingStatus;
    timeSlot : Text;
    timestamp : Int;
    user : Principal;
  };

  type OldMessageType = { #file; #image; #text };
  type OldSenderRole = { #coach; #user };

  type OldMessage = {
    blobId : ?Text;
    message : Text;
    messageType : OldMessageType;
    senderRole : OldSenderRole;
    timestamp : Int;
  };

  type OldMessageHistory = List.List<OldMessage>;

  type OldPointReason = { #custom; #dailyBonus; #footsteps; #weightImage };

  type OldPointRecord = {
    points : Nat;
    reason : OldPointReason;
    remark : Text;
    timestamp : Int;
  };

  type OldUserProfile = {
    age : Nat;
    avatarBlobId : ?Text;
    email : Text;
    height : Text;
    name : Text;
    targetGoal : Text;
    weight : Text;
    whatsAppNumber : Text;
  };

  type OldActor = {
    accessControlState : OldAccessControlState; // dropped — authorization extension removed
    bookingStore : Map.Map<Nat, OldBooking>;
    chatStore : Map.Map<Principal, OldMessageHistory>;
    coachLastReadTimestamps : Map.Map<Principal, Int>;
    lastReadTimestamps : Map.Map<Principal, Int>;
    nanoPerDay : Int; // dropped — now a const expression
    var nextBookingId : Nat;
    pointsStore : Map.Map<Principal, List.List<OldPointRecord>>;
    profileStore : Map.Map<Principal, OldUserProfile>;
    streakStore : Map.Map<Principal, List.List<Int>>;
    timeSlots : [Text]; // dropped — now a const expression
  };

  // ── New types (mirror current actor stable fields) ──

  type NewBookingStatus = { #booked; #cancelled };

  type NewBooking = {
    date : Text;
    id : Nat;
    status : NewBookingStatus;
    timeSlot : Text;
    timestamp : Int;
    user : Principal;
  };

  type NewMessageType = { #file; #image; #text };
  type NewSenderRole = { #coach; #user };

  type NewMessage = {
    blobId : ?Text;
    message : Text;
    messageType : NewMessageType;
    senderRole : NewSenderRole;
    timestamp : Int;
  };

  type NewMessageHistory = List.List<NewMessage>;

  type NewPointReason = { #custom; #dailyBonus; #footsteps; #weightImage };

  type NewPointRecord = {
    points : Nat;
    reason : NewPointReason;
    remark : Text;
    timestamp : Int;
  };

  type NewUserProfile = {
    age : Nat;
    avatarBlobId : ?Text;
    email : Text;
    height : Text;
    name : Text;
    targetGoal : Text;
    weight : Text;
    whatsAppNumber : Text;
  };

  type NewActor = {
    bookingStore : Map.Map<Nat, NewBooking>;
    chatStore : Map.Map<Principal, NewMessageHistory>;
    coachLastReadTimestamps : Map.Map<Principal, Int>;
    lastReadTimestamps : Map.Map<Principal, Int>;
    var nextBookingId : Nat;
    pointsStore : Map.Map<Principal, List.List<NewPointRecord>>;
    profileStore : Map.Map<Principal, NewUserProfile>;
    streakStore : Map.Map<Principal, List.List<Int>>;
  };

  // ── Migration function ──
  // Drops accessControlState, timeSlots, and nanoPerDay.
  // All other fields are type-compatible and passed through directly.
  public func run(old : OldActor) : NewActor {
    {
      bookingStore = old.bookingStore;
      chatStore = old.chatStore;
      coachLastReadTimestamps = old.coachLastReadTimestamps;
      lastReadTimestamps = old.lastReadTimestamps;
      var nextBookingId = old.nextBookingId;
      pointsStore = old.pointsStore;
      profileStore = old.profileStore;
      streakStore = old.streakStore;
    };
  };
};
