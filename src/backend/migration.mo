import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

module {
  type PointRecord = {
    points : Nat;
    reason : PointReason;
    remark : Text;
    timestamp : Int;
  };

  type PointReason = {
    #weightImage;
    #footsteps;
    #dailyBonus;
    #custom;
  };

  type OldPointRecord = {
    points : Nat;
    reason : PointReason;
    timestamp : Int;
  };

  type OldActor = {
    pointsStore : Map.Map<Principal, List.List<OldPointRecord>>;
  };

  type NewActor = {
    pointsStore : Map.Map<Principal, List.List<PointRecord>>;
  };

  public func run(old : OldActor) : NewActor {
    let newPointsStore = old.pointsStore.map<Principal, List.List<OldPointRecord>, List.List<PointRecord>>(
      func(_user, oldList) {
        oldList.map<OldPointRecord, PointRecord>(
          func(oldPointRecord) {
            {
              points = oldPointRecord.points;
              reason = oldPointRecord.reason;
              timestamp = oldPointRecord.timestamp;
              remark = "";
            };
          }
        );
      }
    );
    {
      old with
      pointsStore = newPointsStore;
    };
  };
};
