/**
 * Incident Timeline Builder computing relative chronological milestones.
 */

import type { StateTransitionEvent } from "../fsm/incident_fsm.js";

export interface TimelineEntry {
  offset: string;
  phase: string;
  timestamp: string;
  description: string;
}

/**
 * Transforms raw state transition history into an executive incident timeline.
 */
export class TimelineBuilder {
  /**
   * Constructs chronological relative timeline from FSM transitions.
   *
   * @param transitions State transition events recorded by IncidentFSM
   */
  buildTimeline(transitions: StateTransitionEvent[]): TimelineEntry[] {
    if (transitions.length === 0) return [];

    const firstTime = new Date(transitions[0]?.timestamp || new Date().toISOString()).getTime();

    return transitions.map((t) => {
      const currTime = new Date(t.timestamp).getTime();
      const diffSec = Math.max(0, Math.floor((currTime - firstTime) / 1000));
      const mins = Math.floor(diffSec / 60).toString().padStart(2, "0");
      const secs = (diffSec % 60).toString().padStart(2, "0");

      return {
        offset: `T+${mins}:${secs}`,
        phase: t.to.toUpperCase(),
        timestamp: t.timestamp,
        description: t.reason || `Transitioned to state ${t.to}`,
      };
    });
  }
}
