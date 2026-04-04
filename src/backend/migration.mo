import Map "mo:core/Map";
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

  type OldMessage = {
    senderRole : SenderRole;
    message : Text;
    timestamp : Int;
  };

  type OldMessageHistory = List.List<OldMessage>;

  type OldBooking = {
    id : Nat;
    user : Principal.Principal;
    date : Text;
    timeSlot : Text;
    status : BookingStatus;
    timestamp : Int;
  };

  type BookingStatus = {
    #booked;
    #cancelled;
  };

  type OldActor = {
    profileStore : Map.Map<Principal.Principal, UserProfile>;
    chatStore : Map.Map<Principal.Principal, OldMessageHistory>;
    bookingStore : Map.Map<Nat, OldBooking>;
    nextBookingId : Nat;
  };

  type NewMessage = {
    senderRole : SenderRole;
    message : Text;
    messageType : MessageType;
    blobId : ?Text;
    timestamp : Int;
  };

  type NewMessageHistory = List.List<NewMessage>;
  type NewBooking = {
    id : Nat;
    user : Principal.Principal;
    date : Text;
    timeSlot : Text;
    status : BookingStatus;
    timestamp : Int;
  };

  type NewActor = {
    profileStore : Map.Map<Principal.Principal, UserProfile>;
    chatStore : Map.Map<Principal.Principal, NewMessageHistory>;
    bookingStore : Map.Map<Nat, NewBooking>;
    nextBookingId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newChatStore = old.chatStore.map<Principal.Principal, OldMessageHistory, NewMessageHistory>(
      func(_principal, oldHistory) {
        oldHistory.map<OldMessage, NewMessage>(
          func(oldMessage) {
            {
              senderRole = oldMessage.senderRole;
              message = oldMessage.message;
              messageType = #text;
              blobId = null;
              timestamp = oldMessage.timestamp;
            };
          }
        );
      }
    );

    let newBookingStore = old.bookingStore.map<Nat, OldBooking, NewBooking>(
      func(_id, oldBooking) {
        {
          id = oldBooking.id;
          user = oldBooking.user;
          date = oldBooking.date;
          timeSlot = oldBooking.timeSlot;
          status = oldBooking.status;
          timestamp = oldBooking.timestamp;
        };
      }
    );

    {
      profileStore = old.profileStore;
      chatStore = newChatStore;
      bookingStore = newBookingStore;
      nextBookingId = old.nextBookingId;
    };
  };
};
