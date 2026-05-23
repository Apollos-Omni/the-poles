export const DoorEvents = {
  OPEN_CMD: "OPEN_CMD",
  OPEN_CONFIRM: "OPEN_CONFIRM", 
  CLOSE_CMD: "CLOSE_CMD",
  CLOSE_CONFIRM: "CLOSE_CONFIRM",
  LOCK_CMD: "LOCK_CMD",
  UNLOCK_CMD: "UNLOCK_CMD",
  JAMMED: "JAMMED",
  FAILED: "FAILED",
  BOOT: "BOOT",
  MOTION: "MOTION",
  CMD_ERROR: "CMD_ERROR",
  DENY_EXPIRED: "DENY_EXPIRED",
  DENY_BAD_ACTION: "DENY_BAD_ACTION"
};

export const DoorStates = {
  OPEN: "OPEN",
  CLOSED: "CLOSED", 
  UNKNOWN: "UNKNOWN"
};

export const TicketActions = {
  OPEN: "open",
  CLOSE: "close",
  LOCK: "lock",
  UNLOCK: "unlock"
};

export const RaffleStatuses = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  LOCKED: "LOCKED", 
  DRAWING: "DRAWING",
  COMPLETED: "COMPLETED",
  VOID: "VOID"
};