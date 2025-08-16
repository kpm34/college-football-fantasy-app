// <toolbox:BEGIN toolbox/packages/cli/src/doctor.ts v1>
export async function doctor() {
  const checks = {
    node: process.version,
    ffmpeg: "optional",
    blender: "optional",
    providersPresent: ["OPENAI_API_KEY","ANTHROPIC_API_KEY","RUNWAY_API_KEY","MESHY_API_KEY"].filter(k=>!!process.env[k])
  };
  console.log(JSON.stringify({ ok: true, checks }, null, 2));
}
// <toolbox:END toolbox/packages/cli/src/doctor.ts v1>
