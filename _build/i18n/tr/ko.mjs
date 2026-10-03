// 한국어 번역 (03/10/2026) — 금지어: "미용", "심미" (성형도 피함). 가격·할인율·정액 표현 없음. 이름은 로마자 "Dr. …" 유지.
// 조사: Giang(받침 ㅇ) → 이/과, 나머지(모음 끝) → 가/와
const ga = (sh) => sh + (/Giang$/.test(sh) ? "이" : "가");
const f = (s, sh) => s.replace(/\{sh\}이/g, ga(sh)).replace(/\{sh\}/g, sh);

export const commitments = [
  { t: "서면 치료 계획", d: "치료 시작 전에 내원 횟수, 일정, 재료를 서면으로 안내합니다." },
  { t: "서면 견적", d: "치료 전에 합의하며, 동의 없이 항목이 추가되지 않습니다." },
  { t: "보증", d: "보증 조건은 치료 계획서에 명시됩니다." },
  { t: "디지털 치료 계획", d: "디지털 스캔, 엑스레이, 3D 치료 계획을 진행합니다." },
  { t: "해외 환자 지원", d: "공항 픽업, 영어 가능 팀, 여행 일정 계획을 도와드립니다." },
  { t: "사후 관리와 원격 상담", d: "귀국 후에도 경과를 확인하고 지원합니다." },
];

const implantCases = [
  { t: "Dentium 임플란트와 지르코니아 크라운", d: "임플란트 지지 지르코니아 크라운으로 상실된 치아 6개를 수복하고 기능을 회복하며 턱뼈 보존을 돕습니다.", m: "임플란트" },
  { t: "All-on-6 임플란트 재건", d: "광범위한 치아 상실, 골 소실, 치주 질환에 All-on-6 전악 수복으로 안정적인 기능을 회복했습니다.", m: "전악 임플란트" },
  { t: "All-on-4 전악 수복", d: "여러 치아의 상실과 파절, 골 소실로 크게 손상된 치열에 All-on-4 임플란트를 적용했습니다.", m: "전악 임플란트" },
  { t: "All-on-6 임플란트 재건", d: "진행된 치주염, 3도 골 소실, 치아 6개 상실 후 All-on-6 임플란트로 기능을 회복했습니다.", m: "전악 임플란트" },
  { t: "Dentium 임플란트와 Ceramill 크라운", d: "치아 11개 상실, 심한 마모, 파절, 시린 증상에 임플란트 지지 Ceramill 크라운으로 수복했습니다.", m: "임플란트" },
  { t: "All-on-4 전악 수복", d: "치주염, 치아 동요, 골 소실이 있는 증례에서 All-on-4 임플란트로 상실된 치아 15개를 수복했습니다.", m: "전악 임플란트" },
  { t: "All-on-4 전악 수복", d: "광범위한 치아 상실, 치주염, 치아 동요, 골 소실 후 안정적인 All-on-4 솔루션을 적용했습니다.", m: "전악 임플란트" },
  { t: "Neodent 임플란트와 Ceramill Zolid 보철", d: "임플란트와 세라믹 보철로 상실된 치아 4개를 수복하고 치아 낭종과 치경부 마모를 치료했습니다.", m: "임플란트" },
];
const restoCases = [
  { t: "시린 증상을 동반한 심한 치아 마모", d: "Ceramill Zolid 크라운과 E.max Press 라미네이트로 마모된 치아 구조, 기능, 편안함을 회복했습니다.", m: "2회 내원 · 보존·보철 치료" },
  { t: "골 소실을 동반한 다수 치아 상실", d: "지르코니아 크라운으로 손상된 치아를 수복하고 저작 기능과 안정성을 개선했습니다.", m: "2회 내원 · 보존·보철 치료" },
  { t: "광범위한 우식과 마모를 동반한 치아 상실", d: "Ceramill Zolid 크라운으로 잃은 치아 구조를 재건하고 편안함과 기능을 회복했습니다.", m: "2회 내원 · 보존·보철 치료" },
  { t: "골 소실과 심한 마모를 동반한 치아 상실", d: "Dentium 임플란트와 지르코니아 크라운으로 상실된 치아를 대체하고 마모된 치아를 수복했습니다.", m: "3회 내원 · 임플란트·보철 치료" },
  { t: "깊은 우식을 동반한 치아 상실과 파절", d: "지르코니아 크라운과 Biodentine 수복으로 손상된 치아를 재건하고 보호했습니다.", m: "3회 내원 · 보존·보철 치료" },
  { t: "심한 마모를 동반한 다수 치아 상실", d: "Straumann 임플란트와 지르코니아 크라운으로 상실된 치아를 대체하고 교합을 회복했습니다.", m: "3회 내원 · 임플란트·보철 치료" },
];
const orthoCases = [
  { t: "절단 교합을 동반한 전치부 반대교합", d: "메탈 브라켓으로 전치부 반대교합을 바로잡고 위아래 치열을 정렬해 교합을 개선했습니다.", m: "25개월 · 치아 교정" },
  { t: "총생을 동반한 양악 전돌", d: "메탈 브라켓으로 앞니를 후방 이동·정렬하고 교합을 바로잡아 얼굴의 균형을 개선했습니다.", m: "33개월 · 치아 교정" },
  { t: "과개교합을 동반한 심한 수평 피개", d: "메탈 브라켓으로 수평·수직 피개를 줄이고 위아래 치열을 정렬해 더 균형 잡힌 교합을 만들었습니다.", m: "34개월 · 치아 교정" },
  { t: "잇몸 노출을 동반한 좁은 치열궁", d: "치열궁 확장을 병행한 메탈 브라켓으로 총생과 반대교합을 바로잡았습니다.", m: "21개월 · 치아 교정" },
  { t: "전치부 반대교합을 동반한 3급 부정교합", d: "메탈 브라켓으로 3급 관계를 개선하고 위아래 치열을 정렬해 안정적인 교합을 얻었습니다.", m: "37개월 · 치아 교정" },
  { t: "심한 총생과 치아 배열 불량", d: "메탈 브라켓으로 심한 총생을 바로잡고 위아래 치열을 정렬해 교합을 개선했습니다.", m: "28개월 · 치아 교정" },
  { t: "하악 비대칭을 동반한 아래 앞니 총생", d: "인비절라인으로 겹친 치아를 정렬하고 더 균형 잡힌 교합을 얻었습니다.", m: "25개월 · 치아 교정" },
];

const implantJourney = (sh) => [
  { t: "출국 전", d: `사진과 엑스레이를 보내 주시면 ${ga(sh)} 먼저 의견을 드립니다.` },
  { t: "하노이 도착", d: "공항 픽업과 숙박을 도와드립니다." },
  { t: "검진과 3D 촬영", d: `${sh}의 무료 검진과 CBCT 촬영을 진행합니다.` },
  { t: "서면 계획과 견적", d: "일정과 견적을 서면으로 안내하며, 골이식은 범위로 안내합니다." },
  { t: "임플란트 수술", d: "임플란트를 식립하고, 뼈 상태가 허락하면 임시 치아를 장착합니다." },
  { t: "체류 중 경과 확인", d: "귀국 전에 치유 상태를 확인합니다." },
  { t: "최종 보철과 사후 관리", d: "최종 크라운이나 브리지를 장착한 뒤 원격으로 경과를 확인합니다." },
];
const implantMeta = {
  groups: { pre: "출국 전", t1: "1차 방문 · 약 5–7일", t2: "2차 방문 · 3–6개월 후" },
  gap: "치유 기간", gapLong: "치유 기간 · 3–6개월",
  intro: "대부분의 임플란트 치료는 두 번 방문합니다. 먼저 수술을 하고, 치유 후 최종 치아를 장착합니다.",
  h2: "일곱 단계,", h2em: "모두 서면으로 계획합니다", eyebrow: "임플란트 치료 과정",
};
const orthoJourney = (sh) => [
  { t: "시작 전", d: `사진과 엑스레이(있는 경우)를 보내 주시면 ${ga(sh)} 먼저 의견을 드립니다.` },
  { t: "검진과 자료 수집", d: "무료 검진, 엑스레이, 사진, 3D 스캔을 진행합니다." },
  { t: "서면 계획과 견적", d: "치료 방법, 예상 기간, 견적을 서면으로 안내합니다." },
  { t: "브라켓 또는 투명 교정 장치 장착", d: "계획에 동의하시면 치료를 시작합니다." },
  { t: "정기 점검", d: "병원에서 조정하며, 투명 교정 점검 일부는 원격으로 진행합니다." },
  { t: "마무리", d: "브라켓 제거 전에 교합을 세밀하게 조정합니다." },
  { t: "유지 장치와 사후 관리", d: "결과 유지를 위해 유지 장치를 장착하고 점검합니다." },
];
const orthoMeta = {
  groups: { pre: "시작 전", t1: "초기 내원", t2: "치료 중 · 보통 12–24개월" },
  gap: "치료 기간", gapLong: "치료 기간 · 보통 12–24개월",
  intro: "교정 치료는 단계별로 진행되며, 점검 일정은 거주지에 맞춰 계획합니다.",
  h2: "일곱 단계,", h2em: "모두 서면으로 계획합니다", eyebrow: "교정 치료 과정",
};
const restoJourney = (sh) => [
  { t: "출국 전", d: `사진과 엑스레이를 보내 주시면 ${ga(sh)} 먼저 의견을 드립니다.` },
  { t: "검진과 스캔", d: `${sh}의 무료 검진, 엑스레이, 디지털 스캔을 진행합니다.` },
  { t: "서면 계획과 견적", d: "치료할 치아, 재료, 내원 일정, 견적을 서면으로 안내합니다." },
  { t: "치아 준비", d: "최소한으로 삭제하고, 기공 작업 동안 임시 치아를 장착합니다." },
  { t: "시적", d: "최종 장착 전에 형태, 색상, 교합을 확인합니다." },
  { t: "최종 장착", d: "크라운이나 라미네이트를 부착하고 교합을 확인합니다." },
  { t: "사후 관리", d: "사진으로 원격 확인하며, 필요 시 내원 점검을 받습니다." },
];
const restoMeta = {
  groups: { pre: "출국 전", t1: "1회 방문 · 보통 5–10일", t2: "귀국 후" },
  gap: "귀국", gapLong: "귀국 후 관리",
  intro: "대부분의 라미네이트·크라운 치료는 치료할 치아 수에 따라 한 번의 방문으로 완료됩니다.",
  h2: "일곱 단계,", h2em: "모두 서면으로 계획합니다", eyebrow: "치료 과정",
};

const FAQ = {
  oneTrip: { q: "임플란트 치료를 한 번 방문으로 끝낼 수 있나요?", a: "보통 두 번 방문합니다. 첫 방문(약 5–7일)에 {sh}이 임플란트를 식립하고, All-on-4나 All-on-6의 경우 뼈 상태가 허락하면 고정식 임시 브리지를 장착합니다. 보통 3–6개월 후 임플란트가 치유되면, 며칠 일정의 두 번째 방문에서 최종 브리지나 크라운을 장착합니다. 골이식이 필요한 경우 더 오래 걸릴 수 있으며, {sh}이 촬영 후 계획을 확정합니다." },
  last: { q: "임플란트는 얼마나 오래 사용할 수 있나요?", a: "임플란트는 장기적인 해결책으로 설계됩니다. 꼼꼼한 관리와 정기 검진을 받으면 15–20년 이상 사용하는 경우가 많습니다. 위에 올린 크라운이나 브리지는 시간이 지나면서 유지 관리나 교체가 필요할 수 있습니다." },
  eat: { q: "전악 임플란트 후 평소처럼 식사할 수 있나요?", a: "네, 치유가 끝나고 최종 보철을 장착하면 가능합니다. 수술 직후에는 치유 중인 조직을 보호하기 위한 부드러운 음식 안내를 드립니다." },
  diff: { q: "All-on-4와 All-on-6는 무엇이 다른가요?", a: "두 방법 모두 한 악궁 전체를 고정식 브리지로 대체합니다. All-on-6는 임플란트를 4개가 아닌 6개 사용해 지지력이 더 크며, 골밀도가 낮거나 씹는 힘이 강한 분께 적합할 수 있습니다." },
  costImplant: { q: "비용은 어떻게 정해지나요?", a: "검진과 촬영 후, 치료를 시작하기 전에 서면 견적을 받으십니다. 골이식, 상악동 거상술, 정맥 진정처럼 촬영 결과에 따라 달라지는 항목은 범위로 안내해 예상치 못한 비용이 없도록 합니다." },
  orthoLong: { q: "교정 치료는 보통 얼마나 걸리나요?", a: "많은 경우 12–24개월이 걸리지만, 교합의 복잡도, 치료 방법(브라켓 또는 투명 교정), 계획을 얼마나 꾸준히 따르는지에 따라 달라집니다. 검진 후 예상 기간을 서면으로 안내합니다." },
  retainers: { q: "교정 후 유지 장치가 왜 중요한가요?", a: "치아는 치료 후 원래 위치로 돌아가려는 경향이 있습니다. 유지 장치는 새 위치를 유지하고 재발 위험을 줄여 주므로, 안내대로 착용하는 것도 치료의 일부입니다." },
  abroad: { q: "해외에 살아도 교정 치료를 받을 수 있나요?", a: "대부분 가능합니다. 투명 교정은 브라켓보다 내원 횟수가 적고, 일부 점검은 사진으로 원격 진행할 수 있습니다. 브라켓은 병원에서 정기적인 조정이 필요하므로, 시작 전에 함께 내원 일정을 계획합니다." },
  rootCanal: { q: "신경 치료 후 치아가 다시 감염될 수 있나요?", a: "그럴 수 있습니다. 놓친 근관, 누출, 새로운 충치, 균열, 부실한 최종 수복 등이 재감염의 원인이 됩니다. 가능하면 미세현미경 아래에서 꼼꼼히 세척·밀봉하고, 잘 맞는 최종 수복물을 장착하면 예방에 도움이 됩니다." },
  veneerCrown: { q: "라미네이트와 크라운 중 무엇이 필요한지 어떻게 알 수 있나요?", a: "라미네이트는 형태나 색 변화가 필요하면서 건강한 법랑질이 충분히 남아 있는 치아에 적합할 수 있습니다. 크라운은 보통 치아가 많이 약해졌거나 크게 수복된 경우에 고려합니다. 검진 후 결정합니다." },
  missing: { q: "빠진 치아를 대체하는 방법에는 무엇이 있나요?", a: "빠진 치아의 수와 인접 치아, 뼈의 상태에 따라 임플란트, 임플란트 브리지, 일반 브리지, 틀니 등의 선택지가 있습니다." },
  cost: { q: "비용은 어떻게 정해지나요?", a: "검진 후, 치료를 시작하기 전에 서면 견적을 받으십니다. 치료 중 확인되는 상태에 따라 달라지는 부분은 처음부터 설명드리고 범위로 안내합니다." },
};
const faqs = (ids, sh) => ids.map((k) => ({ q: f(FAQ[k].q, sh), a: f(FAQ[k].a, sh) }));

const C = {
  dds: { t: "치의학 학위 (DDS)", s: "하노이 의과대학교" },
  msc: { t: "구강악안면학 석사", s: "하노이 의과대학교" },
  diu: { t: "외과·보철 임플란트학 대학 간 디플로마 (DIU)", s: "프랑스 보르도 치과대학" },
  m3: { t: "베트남 교정의 교육 프로그램", s: "3M Excellere Asia Pacific" },
  hao: { t: "인비절라인 HAO 마스터 클래스", s: "Invisalign" },
  typo: { t: "타이포돈트 교정 연수 과정", s: "JM Ortho, 하노이" },
  dmg: { t: "라미네이트 심화 과정 및 전악 수복", s: "DMG" },
  plat: (y) => ({ t: `인비절라인 플래티넘 프로바이더 ${y}`, s: "Invisalign" }),
};
const ctaP = (sh, team) => `WhatsApp으로 사진과 궁금한 점을 보내 주세요. ${team ? `${sh} 팀이` : `${ga(sh)} 방문 전에`} 증례를 검토하고 적절한 치료 방향을 안내해 드립니다.`;
const wa = (sh) => `안녕하세요, Greenfield Dental. ${sh}에게 상담을 받고 싶습니다.`;
const YEARS = "임상 경력";
const BADGE = "임상<br>경력";
const yrs = (n) => ({ n: `${n}년+`, l: YEARS });

export const doctors = {
  kate: {
    name: "Dr. Ta Hong Nhung", nick: "Dr. Kate", short: "Dr. Kate", first: "Kate",
    jobTitle: "교정 전문의 · 설립자 겸 진료원장", role: "설립자 겸 진료원장, 교정 전문의", card: "진료원장 · 교정",
    eyebrow: "DDS · MSc · 설립자 겸 진료원장",
    title: "Dr. Ta Hong Nhung (Dr. Kate) — 하노이 교정 전문의 | Greenfield Dental",
    description: "Greenfield Dental(하노이) 설립자 겸 진료원장 Dr. Ta Hong Nhung (Dr. Kate): 인비절라인·투명 교정, 성인·청소년 브라켓 교정, 턱관절·교합 문제. 15년 이상 경력, 인비절라인 플래티넘 프로바이더.",
    lead: "유럽과 아시아에서 수련한 Dr. Ta Hong Nhung (Dr. Kate), MSc는 세심한 치과 진료와 차분하고 존중받는 환자 경험을 함께 제공하기 위해 Greenfield Dental을 설립했습니다. 투명 교정부터 복잡한 교합·턱관절(TMJ) 증례까지, 진료팀과 교정 진료를 이끌고 있습니다.",
    chips: ["인비절라인·투명 교정", "성인·청소년 브라켓 교정", "턱관절·교합 문제"],
    portraitAlt: "Greenfield Dental 설립자 겸 진료원장 Dr. Ta Hong Nhung (Dr. Kate)",
    specialty: ["치아 교정", "근관 치료", "보철"],
    wa: wa("Dr. Kate"),
    ogLine: ["인비절라인·투명 교정 · 브라켓 · 턱관절·교합", "15년 이상 · 인비절라인 플래티넘 프로바이더"],
    stats: [yrs(15), { n: "플래티넘", l: "인비절라인 프로바이더" }],
    badge: { n: "15년+", l: BADGE },
    about: {
      eyebrow: "Dr. Kate 소개", h2: "미소 전체를 위한", h2em: "하나의 계획.",
      imgAlt: "Greenfield Dental에서 환자를 진료하는 Dr. Kate",
      p: [
        "Dr. Kate는 교정, 근관 치료, 보철 진료를 하며, 각 증례를 개별 시술이 아닌 하나의 계획으로 다루고 치료 전·중·후를 사진으로 기록합니다.",
        "불안과 불편, 형식적인 진료를 겪는 환자들을 보며, 모든 환자가 존중받고 편안하게 제대로 돌봄을 받는 병원을 만들기로 했습니다.",
      ],
      creds: [
        { t: "치의학 학위 및 구강악안면학 석사", s: "하노이 의과대학교" },
        { t: "임플란트학 디플로마 (DIU)", s: "프랑스 보르도 대학교" },
        { t: "인비절라인 플래티넘 프로바이더", s: "투명 교정 치료" },
      ],
    },
    expertise: [
      { t: "인비절라인·투명 교정", s: "인비절라인 · 기타 투명 교정 시스템", imgAlt: "손에 든 투명 교정 장치" },
      { t: "성인·청소년 브라켓 교정", s: "메탈 브라켓과 세라믹 브라켓" },
      { t: "턱관절·교합 문제", s: "총생 · 과개교합 · 반대교합 · 턱관절" },
      { t: "미세현미경 신경 치료", s: "신경 치료 · 재신경 치료" },
      { t: "보철 수복", s: "세라믹 크라운 · 인레이·온레이" },
    ],
    quote: { text: "환자는 치료만 받아서는 안 됩니다.", em: "진료의 모든 순간이 편안해야 합니다.", by: "Dr. Ta Hong Nhung — Dr. Kate", role: "Greenfield Dental 설립자 겸 진료원장" },
    certs: [C.dds, C.msc, C.diu, C.m3, C.hao, C.typo, C.plat(2019), C.plat(2020), C.plat(2021)],
    cases: orthoCases,
    journey: orthoJourney("Dr. Kate"), journeyMeta: orthoMeta,
    faqs: faqs(["orthoLong", "retainers", "abroad", "rootCanal", "veneerCrown", "cost"], "Dr. Kate"),
    commitments,
    cta: { h2: "Dr. Kate와", h2em: "상담을 예약하세요.", p: ctaP("Dr. Kate", true) },
    related: [{ t: "인비절라인" }, { t: "브라켓 교정" }],
  },
  chris: {
    name: "Dr. Do Nhu Chuyen", nick: "Dr. Chris", short: "Dr. Chris", first: "Chris",
    jobTitle: "임플란트 전문의", role: "임플란트 전문의", card: "임플란트",
    eyebrow: "DDS · 임플란트 전문의 · Greenfield Dental",
    title: "Dr. Do Nhu Chuyen (Dr. Chris) — 하노이 임플란트 전문의 | Greenfield Dental",
    description: "Greenfield Dental(하노이) 임플란트 외과의 Dr. Do Nhu Chuyen (Dr. Chris): All-on-4 / All-on-6, 단일·다수 임플란트, 진정 하 임플란트 수술. 12년 이상, 임플란트 10,000개 이상 식립.",
    lead: "Dr. Do Nhu Chuyen (Dr. Chris)은 12년 이상의 임상 경력과 10,000개 이상의 임플란트 식립 경험을 가진 임플란트 외과의입니다. 하노이 의과대학교를 졸업했으며, 진정 하 임플란트 수술을 포함한 전악 치료와 복잡한 증례에 집중합니다.",
    chips: ["All-on-4·All-on-6", "단일·다수 임플란트", "진정 하 임플란트 수술"],
    portraitAlt: "Greenfield Dental 임플란트 전문의 Dr. Do Nhu Chuyen (Dr. Chris)",
    specialty: ["임플란트", "구강외과"],
    wa: wa("Dr. Chris"),
    ogLine: ["All-on-4 / All-on-6 · 진정 하 임플란트 수술", "12년 이상 · 임플란트 10,000개 이상"],
    stats: [yrs(12), { l: "식립한 임플란트" }],
    badge: { n: "12년+", l: BADGE },
    about: {
      eyebrow: "Dr. Chris 소개", h2: "모든 미소를 위한", h2em: "정밀함.",
      imgAlt: "Greenfield Dental에서 임플란트 수술 중인 Dr. Chris",
      p: [
        "Dr. Chris는 임플란트, All-on-4·All-on-6, 소수술을 중점적으로 진료합니다. 디지털 계획과 세심한 수술 기법을 결합해 기능과 안정성, 자연스러운 결과를 회복합니다.",
        "Dr. Chris에게 치과 진료란 실질적인 변화를 만드는 일입니다. 환자의 편안함과 자신감을 되찾아 주는 것이 매일의 원동력입니다.",
      ],
      creds: [
        { t: "치의학 학위 (DDS)", s: "하노이 의과대학교" },
        { t: "All-on-4·All-on-6", s: "전악 임플란트 재건" },
        { t: "진정 하 임플란트 수술", s: "복잡한 증례와 전악 증례" },
      ],
    },
    expertise: [
      { t: "All-on-4·All-on-6", s: "전악 재건 · 고정식 치아", imgAlt: "임플란트 위 전악 고정식 브리지" },
      { t: "단일·다수 임플란트", s: "임플란트 식립 · 임플란트 크라운·브리지" },
      { t: "진정 하 임플란트 수술", s: "복잡한 증례와 전악 증례" },
      { t: "골이식·상악동 거상술", s: "임플란트 전 뼈 보강" },
      { t: "사랑니·구강외과", s: "외과적 발치 · 소수술" },
    ],
    quote: { text: "가장 좋은 치료는 경청에서 시작됩니다.", em: "환자 한 분 한 분의 필요를 이해해야 알맞은 해결책을 제안할 수 있습니다.", by: "Dr. Do Nhu Chuyen — Dr. Chris", role: "Greenfield Dental 임플란트 전문의" },
    certs: [C.dds],
    cases: implantCases,
    journey: implantJourney("Dr. Chris"), journeyMeta: implantMeta,
    faqs: faqs(["oneTrip", "last", "eat", "diff", "costImplant"], "Dr. Chris"),
    commitments,
    cta: { h2: "Dr. Chris와", h2em: "상담을 예약하세요.", p: ctaP("Dr. Chris") },
    related: [{ t: "All-on-4 / All-on-6" }, { t: "베트남 임플란트" }],
  },
  henry: {
    name: "Dr. Nguyen Duc Hieu", nick: "Dr. Henry", short: "Dr. Henry", first: "Henry",
    jobTitle: "임플란트 전문의", role: "임플란트 전문의", card: "임플란트",
    eyebrow: "DDS · 임플란트 전문의 · Greenfield Dental",
    title: "Dr. Nguyen Duc Hieu (Dr. Henry) — 하노이 임플란트 전문의 | Greenfield Dental",
    description: "Greenfield Dental(하노이) 임플란트 전문의 Dr. Nguyen Duc Hieu (Dr. Henry): 디지털 임플란트 계획, All-on-4 / All-on-6, 골이식, 구강외과. 6년 이상, 임플란트 1,000건 이상.",
    lead: "Dr. Nguyen Duc Hieu (Dr. Henry)는 디지털 임플란트 계획, 치주, 구강외과에 특히 관심이 깊은 임플란트 전문의입니다. 건강한 뼈와 잇몸 기반에서 시작해 모든 단계를 디지털로 계획하여, 각 임플란트가 오래 기능하도록 만듭니다.",
    chips: ["임플란트", "발치·구강외과", "전악 임플란트 재건"],
    portraitAlt: "Greenfield Dental 임플란트 전문의 Dr. Nguyen Duc Hieu (Dr. Henry)",
    specialty: ["임플란트", "구강외과", "치주"],
    wa: wa("Dr. Henry"),
    ogLine: ["디지털 임플란트 계획 · 골이식 · 구강외과", "6년 이상 · 임플란트 1,000건 이상"],
    stats: [yrs(6), { l: "임플란트 증례" }],
    badge: { n: "6년+", l: BADGE },
    about: {
      eyebrow: "Dr. Henry 소개", h2: "정밀함과 경험이", h2em: "만나는 곳.",
      imgAlt: "Greenfield Dental에서 환자를 진료하는 Dr. Henry",
      p: [
        "Dr. Henry는 임플란트와 소수술을 중점적으로 진료합니다. 디지털 계획과 세심한 수술 기법을 결합해 기능과 안정성, 자연스러운 결과를 회복합니다.",
        "Dr. Henry에게 치과 진료란 실질적인 변화를 만드는 일입니다. 환자가 다시 자신 있게 먹고, 말하고, 웃을 수 있도록 돕는 것이 매일의 원동력입니다.",
      ],
      creds: [
        { t: "치의학 학위 (DDS)", s: "하노이 의과대학교" },
        { t: "임플란트학 디플로마", s: "프랑스 보르도" },
        { t: "디지털 임플란트", s: "3D 스캔과 디지털 치료 계획" },
      ],
    },
    expertise: [
      { t: "단일·다수 임플란트", s: "임플란트 식립 · 임플란트 크라운·브리지" },
      { t: "All-on-4·All-on-6", s: "전악 재건 · 고정식 치아", imgAlt: "임플란트 위 전악 고정식 브리지" },
      { t: "전체 구강 수복", s: "임플란트 · 크라운 · 브리지" },
      { t: "골이식·상악동 거상술", s: "임플란트 전 뼈 보강" },
      { t: "사랑니·구강외과", s: "외과적 발치 · 소수술" },
    ],
    quote: { text: "기초가 바로 서면,", em: "오래가는 결과가 따라옵니다.", by: "Dr. Nguyen Duc Hieu — Dr. Henry", role: "Greenfield Dental 임플란트 전문의" },
    certs: [
      { t: "임플란트 식립", s: "하노이 의과대학교 구강악안면연구소" },
      { t: "OTP 콘셉트 전악 임플란트", s: "DENTIS Vietnam" },
      { t: "치아와 임플란트 주위 재건 수술", s: "Peace of Mind for Dentists" },
      C.dmg,
      { t: "임플란트 보철과 임플란트 주위 연조직 관리", s: "Tín Nha" },
    ],
    cases: implantCases,
    journey: implantJourney("Dr. Henry"), journeyMeta: implantMeta,
    faqs: faqs(["oneTrip", "last", "eat", "diff", "costImplant"], "Dr. Henry"),
    commitments,
    cta: { h2: "Dr. Henry와", h2em: "상담을 예약하세요.", p: ctaP("Dr. Henry") },
    related: [{ t: "베트남 임플란트" }, { t: "All-on-4 / All-on-6" }],
  },
  giang: {
    name: "Dr. Tran Thi Giang", nick: "Dr. Giang", short: "Dr. Giang", first: "Giang",
    jobTitle: "치과의사 — 교정·일반 진료", role: "교정·일반 진료", card: "교정·일반 진료",
    eyebrow: "DDS · 교정·일반 진료",
    title: "Dr. Tran Thi Giang — 하노이 교정·일반 진료 | Greenfield Dental",
    description: "Greenfield Dental(하노이) 치과의사 Dr. Tran Thi Giang: 소아 교정, 성인 브라켓 교정, 라미네이트. 모든 연령의 환자를 차분하고 부드럽게 진료합니다.",
    lead: "Dr. Tran Thi Giang은 모든 연령의 교정 치료를 차분하고 부드럽게 진행하는 치과의사로, 환자마다 맞춤 계획을 세우고 아이들의 내원을 편안하게 만듭니다. 일반 진료와 라미네이트도 세심하게 진료합니다.",
    chips: ["소아 교정", "성인 브라켓 교정", "라미네이트"],
    portraitAlt: "Greenfield Dental 치과의사 Dr. Tran Thi Giang",
    specialty: ["치아 교정", "일반 진료"],
    wa: wa("Dr. Giang"),
    ogLine: ["소아·성인 교정 · 라미네이트", "모든 연령을 위한 차분하고 부드러운 진료"],
    stats: [{ n: "전 연령", l: "소아·성인 교정" }, { n: "DDS", l: "하노이 의과대학교" }],
    about: {
      eyebrow: "Dr. Giang 소개", h2: "자연스러운", h2em: "미소.",
      imgAlt: "Greenfield Dental에서 환자와 함께한 Dr. Giang",
      p: [
        "Dr. Giang은 예방 진료와 충전 치료부터 교정, 라미네이트, 크라운까지 교정과 일반 진료를 환자마다 맞춰 진행합니다.",
        "환자가 더 자신 있게 웃도록 돕고 싶어 치과의사의 길을 택했습니다. 특히 아이들을 위해 모든 내원을 최대한 부드럽고 편안하게 만듭니다.",
      ],
      creds: [
        { t: "치의학 학위 (DDS)", s: "하노이 의과대학교" },
        { t: "전 연령 교정", s: "어린이, 청소년, 성인" },
        { t: "일반 진료", s: "예방 · 보존 · 가족 진료" },
      ],
    },
    expertise: [
      { t: "소아 교정", s: "조기 평가 · 브라켓 · 편안한 내원", imgAlt: "손에 든 투명 교정 장치" },
      { t: "성인 브라켓·투명 교정", s: "메탈 · 세라믹 · 투명 교정" },
      { t: "라미네이트·세라믹 크라운", s: "보존적이고 자연스러운 수복" },
      { t: "일반 진료", s: "검진 · 충전 · 스케일링" },
    ],
    quote: { text: "좋은 미소는 편안함에서 시작됩니다.", em: "모든 내원을 최대한 부드럽고 편안하게 만드는 것이 제 목표입니다.", by: "Dr. Tran Thi Giang", role: "Greenfield Dental 치과의사" },
    certs: [C.dds, C.hao, C.typo, C.dmg],
    cases: restoCases,
    journey: orthoJourney("Dr. Giang"), journeyMeta: orthoMeta,
    faqs: faqs(["orthoLong", "retainers", "abroad", "veneerCrown", "cost"], "Dr. Giang"),
    commitments,
    cta: { h2: "Dr. Giang과", h2em: "상담을 예약하세요.", p: ctaP("Dr. Giang", true) },
    related: [{ t: "라미네이트" }, { t: "크라운" }, { t: "일반 진료" }],
  },
  hailey: {
    name: "Dr. Pham Thi Thu Hien", nick: "Dr. Hailey", short: "Dr. Hailey", first: "Hailey",
    jobTitle: "일반·보존 보철 치과의사", role: "일반·보존 보철 치과의사", card: "일반·보존 보철",
    eyebrow: "DDS · 일반·보존 보철 진료",
    title: "Dr. Pham Thi Thu Hien (Dr. Hailey) — 하노이 보철 진료 | Greenfield Dental",
    description: "Greenfield Dental(하노이) 일반·보존 보철 치과의사 Dr. Pham Thi Thu Hien (Dr. Hailey): 라미네이트, 세라믹 크라운, 인레이·온레이, 미세현미경 신경 치료. 6년 이상, 200건 이상.",
    lead: "Dr. Pham Thi Thu Hien (Dr. Hailey)은 일반·보존 보철 치과의사입니다. 가장 좋은 치료가 항상 가장 큰 치료는 아니라고 믿으며, 건강한 치아를 최대한 보존해 보존적이고 자연스러우며 오래가는 수복을 돕습니다.",
    chips: ["라미네이트·세라믹 크라운", "인레이·온레이", "미세현미경 신경 치료"],
    portraitAlt: "Greenfield Dental 일반·보존 보철 치과의사 Dr. Pham Thi Thu Hien (Dr. Hailey)",
    specialty: ["보존·보철 치료", "근관 치료", "일반 진료"],
    wa: wa("Dr. Hailey"),
    ogLine: ["라미네이트 · 세라믹 크라운 · 미세현미경 신경 치료", "6년 이상 · 라미네이트·크라운 200건 이상"],
    stats: [yrs(6), { l: "라미네이트·크라운 증례" }],
    badge: { n: "6년+", l: BADGE },
    about: {
      eyebrow: "Dr. Hailey 소개", h2: "건강한 치아,", h2em: "자신 있는 미소.",
      imgAlt: "Greenfield Dental에서 환자를 진료하는 Dr. Hailey",
      p: [
        "Dr. Hailey는 정기 진료부터 라미네이트, 세라믹 크라운, 인레이·온레이까지 일반·보존 보철 진료를 하며, 보존적이고 오래가는 결과에 집중합니다.",
        "환자가 자신의 치아를 최대한 오래 건강하게 지키도록 돕고 싶어 치과의사가 되었고, 살릴 수 있는 치아 구조를 기준으로 모든 수복을 계획합니다.",
      ],
      creds: [
        { t: "치의학 학위 (DDS)", s: "하노이 의과대학교" },
        { t: "보존·보철 치료", s: "라미네이트 · 세라믹 크라운 · 인레이·온레이" },
        { t: "미세현미경 신경 치료", s: "자연치아 보존" },
      ],
    },
    expertise: [
      { t: "라미네이트", s: "최소 삭제 · 자연스러운 형태와 색상" },
      { t: "세라믹 크라운·인레이·온레이", s: "약해진 치아 재건" },
      { t: "미세현미경 신경 치료", s: "신경 치료 · 재신경 치료" },
      { t: "투명 교정·브라켓", s: "수복 전 치아 정렬", imgAlt: "손에 든 투명 교정 장치" },
      { t: "일반 진료", s: "검진 · 충전 · 스케일링" },
    ],
    quote: { text: "가장 건강한 치아는 언제나 내 치아입니다.", em: "그 치아를 최대한 오래 지키도록 돕는 것이 제 역할입니다.", by: "Dr. Pham Thi Thu Hien — Dr. Hailey", role: "Greenfield Dental 일반·보존 보철 치과의사" },
    certs: [C.dds, C.hao, C.typo, C.dmg],
    cases: restoCases,
    journey: restoJourney("Dr. Hailey"), journeyMeta: restoMeta,
    faqs: faqs(["veneerCrown", "rootCanal", "missing", "orthoLong", "cost"], "Dr. Hailey"),
    commitments,
    cta: { h2: "Dr. Hailey와", h2em: "상담을 예약하세요.", p: ctaP("Dr. Hailey", true) },
    related: [{ t: "라미네이트" }, { t: "크라운" }, { t: "일반 진료" }],
  },
};
