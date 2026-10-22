export type HelpdeskLocation = {
  id: string;
  name: string;
  district: string;
  districtMl: string;
  address: string;
  phones: string[];
  aliases?: string[];
};

export const helpdeskLocations: HelpdeskLocation[] = [
  {
    id: "kasaragod",
    name: "Kasaragod",
    district: "Kasaragod",
    districtMl: "\u0d15\u0d3e\u0d38\u0d7c\u0d17\u0d4b\u0d21\u0d4d",
    address:
      "Kasargod District Office, Shyama Prasad Mukherjee Mandiram, Sree Narayana Guru Road, Thalipadpu, Kasargod - 671121",
    phones: ["9061871899", "7907591736"],
    aliases: ["Kasargod", "Thalipadpu"],
  },
  {
    id: "kannur-north",
    name: "Kannur North",
    district: "Kannur",
    districtMl: "\u0d15\u0d23\u0d4d\u0d23\u0d42\u0d7c",
    address:
      "Kannur District Office, Mararji Bhavan, Sreepadmam, Near SN Park Road, Kannur - 670001",
    phones: ["9747140020", "9847957238"],
    aliases: ["Kannur City", "SN Park"],
  },
  {
    id: "kannur-south",
    name: "Kannur South",
    district: "Kannur",
    districtMl: "\u0d15\u0d23\u0d4d\u0d23\u0d42\u0d7c",
    address: "Biju Elakkuzhi, Sreelakham, Kuzhikkal, Kayani P.O, Mattannur, Kannur - 670702",
    phones: ["9847460073", "8281313625"],
    aliases: ["Mattannur", "Kayani"],
  },
  {
    id: "wayanad",
    name: "Wayanad",
    district: "Wayanad",
    districtMl: "\u0d35\u0d2f\u0d28\u0d3e\u0d1f\u0d4d",
    address: "Mararji Bhavan, Kalpetta, Near Block Office, Wayanad - 673121",
    phones: ["8594074287", "9495144294"],
    aliases: ["Kalpetta"],
  },
  {
    id: "kozhikode-city",
    name: "Kozhikode City",
    district: "Kozhikode",
    districtMl: "\u0d15\u0d4b\u0d34\u0d3f\u0d15\u0d4d\u0d15\u0d4b\u0d1f\u0d4d",
    address: "Kozhikode District Office, Mararji Bhavan, Thali, Kozhikode - 673002",
    phones: ["9745008764"],
    aliases: ["Calicut", "Thali"],
  },
  {
    id: "kozhikode-north",
    name: "Kozhikode North",
    district: "Kozhikode",
    districtMl: "\u0d15\u0d4b\u0d34\u0d3f\u0d15\u0d4d\u0d15\u0d4b\u0d1f\u0d4d",
    address: "BJP Office, CR Building, Near Coffee House, Nut Street, Vatakara - 673104",
    phones: ["9947502020", "9745334700"],
    aliases: ["Vatakara", "Vadakara", "Nut Street"],
  },
  {
    id: "kozhikode-rural",
    name: "Kozhikode Rural",
    district: "Kozhikode",
    districtMl: "\u0d15\u0d4b\u0d34\u0d3f\u0d15\u0d4d\u0d15\u0d4b\u0d1f\u0d4d",
    address: "Devadas T, Krishnakripa, Nanminda P.O, Kozhikode - 673613",
    phones: ["9388428895", "8590892146"],
    aliases: ["Nanminda"],
  },
  {
    id: "malappuram-central",
    name: "Malappuram Central",
    district: "Malappuram",
    districtMl: "\u0d2e\u0d32\u0d2a\u0d4d\u0d2a\u0d41\u0d31\u0d02",
    address:
      "Malappuram District Office, T.N. Bharathan Smaraka Mandir, Near Municipal Bus Stand, Down Hill P.O, Malappuram - 676505",
    phones: ["9847314267", "9961982332"],
    aliases: ["Down Hill"],
  },
  {
    id: "malappuram-west",
    name: "Malappuram West",
    district: "Malappuram",
    districtMl: "\u0d2e\u0d32\u0d2a\u0d4d\u0d2a\u0d41\u0d31\u0d02",
    address: "Deepa Puzhakkal, Puzhakkal House, Ariyallur P.O, Malappuram - 676312",
    phones: ["9946410948", "9497670740"],
    aliases: ["Ariyallur"],
  },
  {
    id: "malappuram-east",
    name: "Malappuram East",
    district: "Malappuram",
    districtMl: "\u0d2e\u0d32\u0d2a\u0d4d\u0d2a\u0d41\u0d31\u0d02",
    address:
      "Wandoor K. Gopalan Smaraka Mandiram, Schneider Centre, Near PRG Auditorium, Ambalapady, Wandoor P.O - 679328",
    phones: ["7306563399", "9447423492"],
    aliases: ["Wandoor", "Ambalapady"],
  },
  {
    id: "palakkad-west",
    name: "Palakkad West",
    district: "Palakkad",
    districtMl: "\u0d2a\u0d3e\u0d32\u0d15\u0d4d\u0d15\u0d3e\u0d1f\u0d4d",
    address:
      "Adalji Smaraka Mandiram, Vivekananda Road, Near Haridas Builders, Ottapalam, Palakkad - 679101",
    phones: ["9447380477", "9847878448"],
    aliases: ["Ottapalam"],
  },
  {
    id: "palakkad-east",
    name: "Palakkad East",
    district: "Palakkad",
    districtMl: "\u0d2a\u0d3e\u0d32\u0d15\u0d4d\u0d15\u0d3e\u0d1f\u0d4d",
    address:
      "BJP District Office, Amritha Bhavan, District Hospital-Court Road, Harikkara Street, Palakkad",
    phones: ["9037424212", "9447102666"],
    aliases: ["Court Road", "Harikkara"],
  },
  {
    id: "thrissur-south",
    name: "Thrissur South",
    district: "Thrissur",
    districtMl: "\u0d24\u0d43\u0d36\u0d4d\u0d36\u0d42\u0d7c",
    address: "A.R. Sreekumar, Alayil House, Ala P.O, Kotha Parambo, Kodungallur - 680668",
    phones: ["9847178617", "8943540828"],
    aliases: ["Kodungallur", "Ala"],
  },
  {
    id: "thrissur-city",
    name: "Thrissur City",
    district: "Thrissur",
    districtMl: "\u0d24\u0d43\u0d36\u0d4d\u0d36\u0d42\u0d7c",
    address:
      "Thrissur District Office, Pazhaya Nadakkavu, Opposite Pandi Samooha Madam Hall, Thrissur",
    phones: ["9946032240", "8907004422"],
    aliases: ["Pazhaya Nadakkavu"],
  },
  {
    id: "thrissur-north",
    name: "Thrissur North",
    district: "Thrissur",
    districtMl: "\u0d24\u0d43\u0d36\u0d4d\u0d36\u0d42\u0d7c",
    address: "BJP Thrissur North, Dwaraka, ITI Road, West Nada, Guruvayur P.O - 680101",
    phones: ["9496288990", "9048590183"],
    aliases: ["Guruvayur", "West Nada"],
  },
  {
    id: "ernakulam-city",
    name: "Ernakulam City",
    district: "Ernakulam",
    districtMl: "\u0d0e\u0d31\u0d23\u0d3e\u0d15\u0d41\u0d33\u0d02",
    address:
      "Ernakulam District Office, Second Floor, Amrita Tower, S.A. Road, Valanjambalam, Kochi - 682016",
    phones: ["9747473770", "9447658178"],
    aliases: ["Kochi", "Cochin", "Valanjambalam", "SA Road"],
  },
  {
    id: "ernakulam-east",
    name: "Ernakulam East",
    district: "Ernakulam",
    districtMl: "\u0d0e\u0d31\u0d23\u0d3e\u0d15\u0d41\u0d33\u0d02",
    address:
      "Bharatiya Janata Party Ernakulam District East Office, Veloorkunnam, Market P.O, Muvattupuzha - 686673",
    phones: ["9447579261", "9633867266"],
    aliases: ["Muvattupuzha", "Veloorkunnam"],
  },
  {
    id: "ernakulam-north",
    name: "Ernakulam North",
    district: "Ernakulam",
    districtMl: "\u0d0e\u0d31\u0d23\u0d3e\u0d15\u0d41\u0d33\u0d02",
    address:
      "Anaswara, First Floor, XII/510, Residency Lane, Opposite LIC of India, Aluva - 683101",
    phones: ["8301079147", "9387070962"],
    aliases: ["Aluva", "Residency Lane"],
  },
  {
    id: "kottayam-east",
    name: "Kottayam East",
    district: "Kottayam",
    districtMl: "\u0d15\u0d4b\u0d1f\u0d4d\u0d1f\u0d2f\u0d02",
    address: "Sreedharan BJP Office, Ponkunnam P.O, Ponkunnam - 686506",
    phones: ["9847700400", "9946953666"],
    aliases: ["Ponkunnam"],
  },
  {
    id: "kottayam-west",
    name: "Kottayam West",
    district: "Kottayam",
    districtMl: "\u0d15\u0d4b\u0d1f\u0d4d\u0d1f\u0d2f\u0d02",
    address:
      "Kottayam District Office, Mukherji Bhavan, Kodimatha, Near Pallipurathukavu Temple, Kottayam",
    phones: ["9746661105", "9447039265"],
    aliases: ["Kodimatha"],
  },
  {
    id: "idukki-north",
    name: "Idukki North",
    district: "Idukki",
    districtMl: "\u0d07\u0d1f\u0d41\u0d15\u0d4d\u0d15\u0d3f",
    address: "BJP Idukki District North Office, Near Archana Hospital, Thodupuzha - 685584",
    phones: ["9495819004", "9495272828"],
    aliases: ["Thodupuzha"],
  },
  {
    id: "idukki-south",
    name: "Idukki South",
    district: "Idukki",
    districtMl: "\u0d07\u0d1f\u0d41\u0d15\u0d4d\u0d15\u0d3f",
    address: "BJP Office Aravindham, Idukki Colony P.O, Cheruthoni, Idukki - 685602",
    phones: ["9947868114", "9447877151"],
    aliases: ["Cheruthoni", "Idukki Colony"],
  },
  {
    id: "alappuzha-south",
    name: "Alappuzha South",
    district: "Alappuzha",
    districtMl: "\u0d06\u0d32\u0d2a\u0d4d\u0d2a\u0d41\u0d34",
    address:
      "Parumala Smruthi Bhavan, Thampuran Building, Near Overbridge Court Junction, Mavelikkara - 690101",
    phones: ["9947576800", "7012590430"],
    aliases: ["Mavelikkara", "Court Junction"],
  },
  {
    id: "alappuzha-north",
    name: "Alappuzha North",
    district: "Alappuzha",
    districtMl: "\u0d06\u0d32\u0d2a\u0d4d\u0d2a\u0d41\u0d34",
    address: "Alappuzha District Office, Mararji Bhavan, Iron Bridge P.O, Alappuzha",
    phones: ["8281745974", "9446119217"],
    aliases: ["Alleppey", "Iron Bridge"],
  },
  {
    id: "pathanamthitta",
    name: "Pathanamthitta",
    district: "Pathanamthitta",
    districtMl: "\u0d2a\u0d24\u0d4d\u0d24\u0d28\u0d02\u0d24\u0d3f\u0d1f\u0d4d\u0d1f",
    address:
      "Pathanamthitta District Office, Mararji Bhavan, Anappara P.O, Kumbazha, Pathanamthitta",
    phones: ["9447357496", "8281158971"],
    aliases: ["Kumbazha", "Anappara"],
  },
  {
    id: "kollam-west",
    name: "Kollam West",
    district: "Kollam",
    districtMl: "\u0d15\u0d4a\u0d32\u0d4d\u0d32\u0d02",
    address:
      "Kollam District Office, Deenadayal Bhavan, T.D. Temple, Anandavalleswaram, Near High School Junction, Kollam",
    phones: ["9567255413", "9447410553"],
    aliases: ["Anandavalleswaram", "High School Junction"],
  },
  {
    id: "kollam-east",
    name: "Kollam East",
    district: "Kollam",
    districtMl: "\u0d15\u0d4a\u0d32\u0d4d\u0d32\u0d02",
    address:
      "BJP Kollam East District Committee Office, Namo Mandir, Near Railway Station Junction, Kottarakkara - 691506",
    phones: ["9633315282", "9847102212"],
    aliases: ["Kottarakkara", "Kottarakara"],
  },
  {
    id: "thiruvananthapuram-city",
    name: "Thiruvananthapuram City",
    district: "Thiruvananthapuram",
    districtMl: "\u0d24\u0d3f\u0d30\u0d41\u0d35\u0d28\u0d28\u0d4d\u0d24\u0d2a\u0d41\u0d30\u0d02",
    address:
      "BJP Thiruvananthapuram District Office, Tenra 6, Near Police Training College, Thycaud P.O, Thiruvananthapuram - 695014",
    phones: ["9447211864", "9495202151"],
    aliases: ["Trivandrum", "Thycaud"],
  },
  {
    id: "thiruvananthapuram-north",
    name: "Thiruvananthapuram North",
    district: "Thiruvananthapuram",
    districtMl: "\u0d24\u0d3f\u0d30\u0d41\u0d35\u0d28\u0d28\u0d4d\u0d24\u0d2a\u0d41\u0d30\u0d02",
    address: "S.R. Rejikumar, Nirmalya, Vamanapuram P.O - 695606",
    phones: ["9447903642", "9446795230"],
    aliases: ["Vamanapuram"],
  },
  {
    id: "thiruvananthapuram-south",
    name: "Thiruvananthapuram South",
    district: "Thiruvananthapuram",
    districtMl: "\u0d24\u0d3f\u0d30\u0d41\u0d35\u0d28\u0d28\u0d4d\u0d24\u0d2a\u0d41\u0d30\u0d02",
    address:
      "Bharatiya Janata Party South District Office, Namo Bhavan, Moonukallinmoodu, Neyyattinkara, Near GR Public School - 695121",
    phones: ["9995358151", "9446614911"],
    aliases: ["Neyyattinkara", "Moonukallinmoodu"],
  },
];

export const helpdeskDistricts = Array.from(
  new Map(
    helpdeskLocations.map((location) => [
      location.district,
      { name: location.district, nameMl: location.districtMl },
    ]),
  ).values(),
);

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export function findHelpdeskLocations(query = "", district = "all") {
  const terms = normalize(query).split(" ").filter(Boolean);
  return helpdeskLocations.filter((location) => {
    if (district !== "all" && location.district !== district) return false;
    if (!terms.length) return true;
    const searchable = normalize(
      [
        location.name,
        location.district,
        location.districtMl,
        location.address,
        ...(location.aliases ?? []),
        ...location.phones,
      ].join(" "),
    );
    return terms.every((term) => searchable.includes(term));
  });
}

export function getHelpdeskLocation(id: string) {
  return helpdeskLocations.find((location) => location.id === id);
}
