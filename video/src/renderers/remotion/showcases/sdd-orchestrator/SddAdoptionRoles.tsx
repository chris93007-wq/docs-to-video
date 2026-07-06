import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {sequenceOpacity} from "../../../../utils/animation";

const roles = [
  {label: "Engineers", value: "Less Cognitive Load", icon: "worker" as const, color: theme.colors.teal},
  {label: "PMs", value: "Requirements Traceability", icon: "document" as const, color: theme.colors.violet},
  {label: "EMs", value: "Repeatable Delivery", icon: "timeline" as const, color: theme.colors.accent},
];

export const SddAdoptionRoles = ({frame, startFrame = 0}: {frame: number; startFrame?: number}) => (
  <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22}}>
    {roles.map((role, index) => (
      <div key={role.label} style={{minHeight: 210, borderRadius: theme.radius.lg, background: "rgba(255,255,255,0.92)", boxShadow: theme.shadow.soft, padding: 28, opacity: sequenceOpacity(frame - startFrame, index, 14)}}>
        <EngineeringIcon name={role.icon} stroke={role.color} size={68} />
        <div style={{...theme.typography.h2, fontSize: 36, marginTop: 20}}>{role.label}</div>
        <div style={{...theme.typography.body, color: theme.colors.muted, marginTop: 12}}>{role.value}</div>
      </div>
    ))}
  </div>
);
