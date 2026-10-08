/**
 * Incident Lifecycle Finite State Machine (FSM).
 * Enforces strictly valid state transitions across the Autonomous SRE lifecycle:
 * IDLE -> ALERT_DETECTED -> DIAGNOSING -> SANDBOX_REPRODUCING -> HEALING -> VERIFYING -> PR_SUBMITTED
 */

import { IncidentState } from "../types/index.js";

export interface StateTransitionEvent {
  incidentId: string;
  from: IncidentState;
  to: IncidentState;
  timestamp: string;
  reason?: string;
}

export type TransitionListener = (event: StateTransitionEvent) => void;

/**
 * Finite State Machine enforcing valid incident progression and timeline logging.
 */
export class IncidentFSM {
  private currentState: IncidentState = IncidentState.IDLE;
  private readonly incidentId: string;
  private readonly timeline: StateTransitionEvent[] = [];
  private readonly listeners: Set<TransitionListener> = new Set();

  /**
   * Initializes incident FSM.
   *
   * @param incidentId Unique correlation identifier
   */
  constructor(incidentId: string) {
    this.incidentId = incidentId;
    this.timeline.push({
      incidentId,
      from: IncidentState.IDLE,
      to: IncidentState.IDLE,
      timestamp: new Date().toISOString(),
      reason: "Incident FSM initialized",
    });
  }

  /**
   * Returns current lifecycle state.
   */
  getState(): IncidentState {
    return this.currentState;
  }

  /**
   * Returns complete chronological transition timeline.
   */
  getTimeline(): StateTransitionEvent[] {
    return [...this.timeline];
  }

  /**
   * Registers a callback listener invoked on valid state transitions.
   *
   * @param listener Callback receiving transition event
   */
  subscribe(listener: TransitionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Transition to next state if valid according to autonomous SRE invariants.
   *
   * @param target Next desired state
   * @param reason Contextual reason for state advance
   */
  transitionTo(target: IncidentState, reason?: string): void {
    const valid = this.isValidTransition(this.currentState, target);

    // Guard clause: Disallow invalid or out-of-order state transitions
    if (!valid) {
      throw new Error(
        `[IncidentFSM] Invalid state transition rejected: cannot transition from ${this.currentState} to ${target}`
      );
    }

    const event: StateTransitionEvent = {
      incidentId: this.incidentId,
      from: this.currentState,
      to: target,
      timestamp: new Date().toISOString(),
      reason,
    };

    this.currentState = target;
    this.timeline.push(event);

    // Notify registered subscribers
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("[IncidentFSM] Subscriber error during transition:", err);
      }
    }
  }

  /**
   * Validates if transition from source to target is permitted.
   */
  private isValidTransition(from: IncidentState, to: IncidentState): boolean {
    // Self-transitions allowed for progress pulses
    if (from === to) return true;

    // Terminal states cannot transition further
    if (from === IncidentState.PR_SUBMITTED || from === IncidentState.FAILED) {
      return false;
    }

    // Any non-terminal state can transition to FAILED upon unrecoverable error
    if (to === IncidentState.FAILED) {
      return true;
    }

    switch (from) {
      case IncidentState.IDLE:
        return to === IncidentState.ALERT_DETECTED;
      case IncidentState.ALERT_DETECTED:
        return to === IncidentState.DIAGNOSING;
      case IncidentState.DIAGNOSING:
        return to === IncidentState.SANDBOX_REPRODUCING;
      case IncidentState.SANDBOX_REPRODUCING:
        return to === IncidentState.HEALING;
      case IncidentState.HEALING:
        return to === IncidentState.VERIFYING;
      case IncidentState.VERIFYING:
        // Verification success leads to PR; verification failure triggers retry in HEALING
        return to === IncidentState.PR_SUBMITTED || to === IncidentState.HEALING;
      default:
        return false;
    }
  }
}
