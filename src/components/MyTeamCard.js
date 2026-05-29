"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./MyTeamCard.module.css";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getExpBadge(level) {
  const map = {
    beginner: { label: "Beginner", cls: "expBeginner" },
    intermediate: { label: "Intermediate", cls: "expIntermediate" },
    veteran: { label: "Veteran", cls: "expVeteran" },
  };
  return map[level] || map.beginner;
}

/**
 * MyTeamCard — Expanded management card for teams you lead.
 * Shows members with details and join requests with accept/reject.
 */
export default function MyTeamCard({ team }) {
  const [requests, setRequests] = useState(team.join_requests || []);
  const [expandedRequest, setExpandedRequest] = useState(null);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const spotsLeft = team.max_members - team.members.length;

  function handleAccept(reqId) {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "accepted" } : r))
    );
  }

  function handleReject(reqId) {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "rejected" } : r))
    );
  }

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h3 className={styles.teamName}>{team.name}</h3>
            <span className={styles.youBadge}>👑 You lead</span>
          </div>
          <Link href={`/dashboard/hackathons/${team.hackathon_id}`} className={styles.hackathonLink}>
            🏆 {team.hackathon_title}
          </Link>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.memberCounter}>
            <span className={styles.counterVal}>{team.members.length}</span>
            <span className={styles.counterSep}>/</span>
            <span className={styles.counterMax}>{team.max_members}</span>
          </div>
          {pendingCount > 0 && (
            <span className={styles.pendingBadge}>
              {pendingCount} pending
            </span>
          )}
        </div>
      </div>

      <p className={styles.description}>{team.description}</p>

      {/* Current Members */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <span>Members</span>
          <span className={styles.spotsLeft}>{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} open</span>
        </h4>
        <div className={styles.membersList}>
          {team.members.map((member) => (
            <div key={member.id} className={styles.memberRow}>
              <div className={styles.memberAvatar}>
                {member.name[0].toUpperCase()}
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberNameRow}>
                  <span className={styles.memberName}>{member.name}</span>
                  {member.role === "leader" && (
                    <span className={styles.leaderTag}>👑 Leader</span>
                  )}
                </div>
                {member.skills && (
                  <div className={styles.memberSkills}>
                    {member.skills.map((s) => (
                      <span key={s} className={styles.miniSkill}>{s}</span>
                    ))}
                  </div>
                )}
                {member.bio && (
                  <p className={styles.memberBio}>{member.bio}</p>
                )}
                <span className={styles.joinedDate}>
                  Joined {formatDate(member.joined_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Requests */}
      {requests.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>
            <span>Join Requests</span>
            <span className={styles.reqCount}>{requests.length} total</span>
          </h4>
          <div className={styles.requestsList}>
            {requests.map((req) => {
              const isExpanded = expandedRequest === req.id;
              const exp = getExpBadge(req.user.experience_level);

              return (
                <div
                  key={req.id}
                  className={`${styles.requestCard} ${styles[`req_${req.status}`]}`}
                >
                  <div
                    className={styles.requestHeader}
                    onClick={() =>
                      setExpandedRequest(isExpanded ? null : req.id)
                    }
                  >
                    <div className={styles.requestAvatar}>
                      {req.user.name[0].toUpperCase()}
                    </div>
                    <div className={styles.requestMeta}>
                      <div className={styles.requestNameRow}>
                        <span className={styles.requestName}>
                          {req.user.name}
                        </span>
                        <span className={`${styles.expBadge} ${styles[exp.cls]}`}>
                          {exp.label}
                        </span>
                      </div>
                      <span className={styles.requestDate}>
                        Requested {formatDate(req.requested_at)}
                      </span>
                    </div>
                    <div className={styles.requestStatusArea}>
                      {req.status === "pending" && (
                        <span className={styles.statusPending}>● Pending</span>
                      )}
                      {req.status === "accepted" && (
                        <span className={styles.statusAccepted}>✓ Accepted</span>
                      )}
                      {req.status === "rejected" && (
                        <span className={styles.statusRejected}>✗ Rejected</span>
                      )}
                      <span className={styles.expandArrow}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className={styles.requestBody}>
                      {/* Skills */}
                      <div className={styles.requestSkills}>
                        {req.user.skills.map((s) => (
                          <span key={s} className={styles.reqSkillTag}>
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Bio */}
                      <p className={styles.requestBio}>{req.user.bio}</p>

                      {/* Message */}
                      <div className={styles.requestMessage}>
                        <span className={styles.msgLabel}>Message:</span>
                        <p className={styles.msgText}>
                          &ldquo;{req.message}&rdquo;
                        </p>
                      </div>

                      {/* Actions */}
                      {req.status === "pending" && (
                        <div className={styles.requestActions}>
                          <button
                            className={styles.acceptBtn}
                            onClick={() => handleAccept(req.id)}
                          >
                            ✓ Accept
                          </button>
                          <button
                            className={styles.rejectBtn}
                            onClick={() => handleReject(req.id)}
                          >
                            ✗ Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Looking For */}
      <div className={styles.lookingFor}>
        <span className={styles.lfLabel}>LOOKING FOR:</span>
        {team.looking_for.map((s) => (
          <span key={s} className={styles.lfTag}>{s}</span>
        ))}
      </div>
    </div>
  );
}
