/** Explicit correspondence between mobile Applications IDs and Location Master IDs. */
export const mobileReportDistrictIds: Record<string, string> = {
  kasaragod: "od-ksd",
  kannur_north: "od-knr-north",
  kannur_south: "od-knr-south",
  wayanad: "od-wyd",
  kozhikode_city: "od-kkd-city",
  kozhikode_north: "od-kkd-north",
  kozhikode_rural: "od-kkd-rural",
  malappuram_central: "od-mlp-central",
  malappuram_east: "od-mlp-east",
  malappuram_west: "od-mlp-west",
  palakkad_east: "od-pkd-east",
  palakkad_west: "od-pkd-west",
  thrissur_city: "od-tsr-city",
  thrissur_north: "od-tsr-north",
  thrissur_south: "od-tsr-south",
  ernakulam_city: "od-ekm-city",
  ernakulam_north: "od-ekm-north",
  ernakulam_east: "od-ekm-east",
  idukki_north: "od-idk-north",
  idukki_south: "od-idk-south",
  kottayam_east: "od-ktm-east",
  kottayam_west: "od-ktm-west",
  alappuzha_north: "od-alp-north",
  alappuzha_south: "od-alp-south",
  pathanamthitta: "od-ptm",
  kollam_east: "od-klm-east",
  kollam_west: "od-klm-west",
  thiruvananthapuram_city: "od-tvm-city",
  thiruvananthapuram_north: "od-tvm-north",
  thiruvananthapuram_south: "od-tvm-south",
};

export const mobileReportRegionIds: Record<string, string> = {
  north: "reg-north",
  central: "reg-central",
  south: "reg-south",
};

export function reportLocationIdToMaster(
  level: "region" | "org_district",
  id: string,
): string | null {
  return (level === "region" ? mobileReportRegionIds : mobileReportDistrictIds)[id] ?? null;
}

export function masterLocationIdToReport(
  level: "region" | "org_district",
  id: string,
): string | null {
  const entries = Object.entries(
    level === "region" ? mobileReportRegionIds : mobileReportDistrictIds,
  );
  return entries.find(([, masterId]) => masterId === id)?.[0] ?? null;
}
