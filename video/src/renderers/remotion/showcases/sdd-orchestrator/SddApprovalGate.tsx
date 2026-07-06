import {interpolate} from "remotion";
import {EngineeringIcon} from "../../../../assets/icons/EngineeringIcons";
import {theme} from "../../../../styles/theme";
import {clamp, fadeIn, sequenceOpacity} from "../../../../utils/animation";
import {ShowcaseFrame, ShowcaseSceneProps, useSceneBeats} from "./shared";

const documents = [
  {label: "Requirements", color: theme.colors.violet},
  {label: "Design", color: theme.colors.accent},
  {label: "Implementation Plan", color: theme.colors.gold},
  {label: "Test Plan", color: theme.colors.red},
  {label: "Evidence Summary", color: theme.colors.teal},
];

const checkpoints = [
  {label: "Small artifact", detail: "One decision at a time", icon: "document" as const, color: theme.colors.accent},
  {label: "Review boundary", detail: "Owner and outcome are clear", icon: "approval" as const, color: theme.colors.gold},
  {label: "Validation gate", detail: "Evidence before progress", icon: "gate" as const, color: theme.colors.red},
  {label: "Lifecycle state", detail: "Completed, waiting, next", icon: "timeline" as const, color: theme.colors.teal},
];

const friction = ["Unclear order", "Review overload", "Hard approvals", "No shared lifecycle view"];

export const SddApprovalGate = (props: ShowcaseSceneProps) => {
  const {frame, fadeAt} = useSceneBeats(props);
  const collapse = interpolate(frame, [94, 246], [0, 1], clamp);
  const reviewLoad = interpolate(frame, [42, 190], [0.16, 0.96], clamp);
  const stagedReveal = interpolate(frame, [210, 388], [0, 1], clamp);

  return (
    <ShowcaseFrame eyebrow="The Adoption Gap" title={props.scene.title}>
      <div style={{position: "absolute", left: 96, right: 96, top: 252, height: 104, borderRadius: theme.radius.lg, background: theme.gradients.dark, color: theme.colors.white, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 24px 80px rgba(21,27,43,0.2)", opacity: fadeAt(0, 0.5)}}>
        <div style={{...theme.typography.h2, color: theme.colors.white, fontSize: 42}}>
          The skills are powerful. <span style={{color: "#8FD8FF"}}>The missing piece was a guided way to use them.</span>
        </div>
      </div>

      <div style={{position: "absolute", left: 96, top: 392, width: 760, height: 512, borderRadius: 30, background: "rgba(255,255,255,0.9)", boxShadow: theme.shadow.soft, overflow: "hidden", opacity: fadeAt(0, 1)}}>
        <div style={{position: "absolute", left: 34, top: 28}}>
          <div style={{...theme.typography.label, color: theme.colors.red, textTransform: "uppercase"}}>Generated Output</div>
          <div style={{...theme.typography.h2, fontSize: 34, marginTop: 8}}>Review burden keeps growing</div>
        </div>

        <div style={{position: "absolute", left: 44, top: 124, width: 430, height: 290}}>
          {documents.map((document, index) => {
            const opacity = sequenceOpacity(frame - 30, index, 12);
            const x = index * 34 * (1 - collapse);
            const y = index * 28 * (1 - collapse);
            const rotation = (index - 2) * 2.4 * (1 - collapse);
            return (
              <div key={document.label} style={{position: "absolute", left: x, top: y, width: 350, height: 226, borderRadius: 18, background: theme.colors.white, border: `2px solid ${document.color}`, boxShadow: "0 18px 50px rgba(31,41,55,0.14)", padding: 24, opacity, transform: `rotate(${rotation}deg)`}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <div style={{...theme.typography.label, color: document.color}}>{document.label}</div>
                  <EngineeringIcon name="document" stroke={document.color} size={42} />
                </div>
                {[1, 0.86, 0.72, 0.9].map((width, lineIndex) => (
                  <div key={lineIndex} style={{height: 8, width: `${width * 100}%`, borderRadius: 99, background: lineIndex === 0 ? document.color : theme.colors.line, opacity: lineIndex === 0 ? 0.32 : 0.82, marginTop: lineIndex === 0 ? 24 : 14}} />
                ))}
              </div>
            );
          })}
        </div>

        <div style={{position: "absolute", right: 36, top: 130, width: 190, height: 300}}>
          <div style={{...theme.typography.small, color: theme.colors.muted}}>Review load</div>
          <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: 252, borderRadius: 18, background: theme.colors.surfaceMuted, overflow: "hidden", border: `1px solid ${theme.colors.line}`}}>
            <div style={{position: "absolute", left: 0, right: 0, bottom: 0, height: `${reviewLoad * 100}%`, background: "linear-gradient(180deg, #F7C75E 0%, #D6455D 100%)"}} />
            <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", ...theme.typography.h2, fontSize: 32, color: reviewLoad > 0.58 ? theme.colors.white : theme.colors.ink}}>
              {Math.round(reviewLoad * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div style={{position: "absolute", left: 866, top: 592, width: 120, height: 72, opacity: fadeIn(frame, 184, 20)}}>
        <svg width="120" height="72" viewBox="0 0 120 72">
          <path d="M8 36h86" stroke={theme.colors.teal} strokeWidth="8" strokeLinecap="round" />
          <path d="m82 14 28 22-28 22" fill="none" stroke={theme.colors.teal} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div style={{position: "absolute", right: 94, top: 392, width: 840, height: 512, borderRadius: 30, background: theme.gradients.dark, color: theme.colors.white, boxShadow: "0 30px 100px rgba(21,27,43,0.22)", overflow: "hidden", opacity: fadeAt(2, 6.2)}}>
        <div style={{position: "absolute", left: 34, top: 28}}>
          <div style={{...theme.typography.label, color: "#72E1CE", textTransform: "uppercase"}}>With Orchestration</div>
          <div style={{...theme.typography.h2, color: theme.colors.white, fontSize: 34, marginTop: 8}}>Smaller, staged, reviewable checkpoints</div>
        </div>
        <div style={{position: "absolute", left: 36, right: 36, top: 126, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18}}>
          {checkpoints.map((item, index) => {
            const opacity = sequenceOpacity(frame - 210, index, 15) * stagedReveal;
            return (
              <div key={item.label} style={{minHeight: 142, borderRadius: 20, background: "rgba(255,255,255,0.94)", color: theme.colors.ink, border: `2px solid ${item.color}`, padding: 20, display: "grid", gridTemplateColumns: "62px 1fr", gap: 16, alignItems: "center", opacity, transform: `translateY(${interpolate(opacity, [0, 1], [20, 0], clamp)}px)`}}>
                <EngineeringIcon name={item.icon} stroke={item.color} size={54} />
                <div>
                  <div style={{...theme.typography.label, color: theme.colors.ink}}>{item.label}</div>
                  <div style={{...theme.typography.small, color: theme.colors.muted, marginTop: 7}}>{item.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{position: "absolute", left: 96, right: 96, bottom: 72, display: "flex", justifyContent: "center", gap: 14}}>
        {friction.map((label, index) => (
          <div key={label} style={{padding: "12px 18px", borderRadius: theme.radius.pill, background: index < 2 ? theme.colors.redSoft : theme.colors.goldSoft, color: index < 2 ? theme.colors.red : theme.colors.gold, ...theme.typography.small, fontWeight: 780, opacity: sequenceOpacity(frame - 110, index, 8)}}>
            {label}
          </div>
        ))}
      </div>
    </ShowcaseFrame>
  );
};

