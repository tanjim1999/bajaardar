import { NextRequest, NextResponse } from "next/server";

export interface TcbTruckPointData {
  id: string;
  nameBn: string;
  nameEn: string;
  areaBn: string;
  areaEn: string;
  division: string;
  district: string;
  operatingHours: string;
  dailyFamilyQuota: number;
  status: "ACTIVE" | "CROWDED" | "RESTOCKING";
  coordinates?: { lat: number; lng: number };
}

const TCB_TRUCK_LOCATIONS: TcbTruckPointData[] = [
  {
    id: "tcb_loc_1",
    nameBn: "টিসিবি ভবন চত্বর, কাওরান বাজার",
    nameEn: "TCB Bhaban Square, Karwan Bazar",
    areaBn: "কাওরান বাজার, ঢাকা",
    areaEn: "Karwan Bazar, Dhaka",
    division: "Dhaka",
    district: "Dhaka",
    operatingHours: "09:30 AM - 04:00 PM",
    dailyFamilyQuota: 400,
    status: "ACTIVE",
    coordinates: { lat: 23.7516, lng: 90.3933 },
  },
  {
    id: "tcb_loc_2",
    nameBn: "জাতীয় প্রেস ক্লাব চত্বর",
    nameEn: "National Press Club Square",
    areaBn: "তোপখানা রোড, পল্টন",
    areaEn: "Topkhana Road, Paltan",
    division: "Dhaka",
    district: "Dhaka",
    operatingHours: "09:30 AM - 04:00 PM",
    dailyFamilyQuota: 350,
    status: "CROWDED",
    coordinates: { lat: 23.7314, lng: 90.4079 },
  },
  {
    id: "tcb_loc_3",
    nameBn: "ফার্মগেট মোড় (আনন্দ সিনেমা সংলগ্ন)",
    nameEn: "Farmgate Intersection (Near Ananda Cinema)",
    areaBn: "ফার্মগেট, ঢাকা",
    areaEn: "Farmgate, Dhaka",
    division: "Dhaka",
    district: "Dhaka",
    operatingHours: "09:30 AM - 03:30 PM",
    dailyFamilyQuota: 300,
    status: "ACTIVE",
    coordinates: { lat: 23.7588, lng: 90.3887 },
  },
  {
    id: "tcb_loc_4",
    nameBn: "মিরপুর-১০ গোলচত্বর ফায়ার সার্ভিস মোড়",
    nameEn: "Mirpur-10 Fire Station Point",
    areaBn: "মিরপুর, ঢাকা",
    areaEn: "Mirpur, Dhaka",
    division: "Dhaka",
    district: "Dhaka",
    operatingHours: "09:30 AM - 04:00 PM",
    dailyFamilyQuota: 350,
    status: "ACTIVE",
    coordinates: { lat: 23.8069, lng: 90.3686 },
  },
  {
    id: "tcb_loc_5",
    nameBn: "মতিঝিল শাপলা চত্বর",
    nameEn: "Motijheel Shapla Chattar",
    areaBn: "মতিঝিল বাণিজ্যিক এলাকা",
    areaEn: "Motijheel C/A",
    division: "Dhaka",
    district: "Dhaka",
    operatingHours: "09:30 AM - 04:00 PM",
    dailyFamilyQuota: 300,
    status: "ACTIVE",
    coordinates: { lat: 23.7299, lng: 90.4206 },
  },
  {
    id: "tcb_loc_6",
    nameBn: "উত্তরা আজমপুর বাসস্ট্যান্ড মোড়",
    nameEn: "Uttara Azampur Bus Stand Point",
    areaBn: "সেক্টর ৭, উত্তরা",
    areaEn: "Sector 7, Uttara",
    division: "Dhaka",
    district: "Dhaka",
    operatingHours: "10:00 AM - 04:00 PM",
    dailyFamilyQuota: 300,
    status: "RESTOCKING",
    coordinates: { lat: 23.8683, lng: 90.3995 },
  },
  {
    id: "tcb_loc_7",
    nameBn: "ধানমন্ডি ৩২ (সোবহানবাগ মসজিদ পয়েন্ট)",
    nameEn: "Dhanmondi 32 (Sobhanbagh Point)",
    areaBn: "ধানমন্ডি, ঢাকা",
    areaEn: "Dhanmondi, Dhaka",
    division: "Dhaka",
    district: "Dhaka",
    operatingHours: "09:30 AM - 03:30 PM",
    dailyFamilyQuota: 300,
    status: "ACTIVE",
    coordinates: { lat: 23.7519, lng: 90.3776 },
  },
  {
    id: "tcb_loc_8",
    nameBn: "চট্টগ্রাম আগ্রাবাদ বাদামতলী মোড়",
    nameEn: "Agrabad Badamtali Square, Chattogram",
    areaBn: "আগ্রাবাদ, চট্টগ্রাম",
    areaEn: "Agrabad, Chattogram",
    division: "Chittagong",
    district: "Chattogram",
    operatingHours: "09:30 AM - 04:00 PM",
    dailyFamilyQuota: 350,
    status: "ACTIVE",
    coordinates: { lat: 22.3275, lng: 91.8122 },
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const division = searchParams.get("division");
    const status = searchParams.get("status");

    let points = [...TCB_TRUCK_LOCATIONS];

    if (division && division !== "ALL") {
      points = points.filter((p) => p.division.toLowerCase() === division.toLowerCase());
    }

    if (status) {
      points = points.filter((p) => p.status.toUpperCase() === status.toUpperCase());
    }

    const totalFamiliesCovered = points.reduce((acc, p) => acc + p.dailyFamilyQuota, 0);

    return NextResponse.json({
      success: true,
      meta: {
        totalPoints: points.length,
        totalDailyFamilyCapacity: totalFamiliesCovered,
        activeTrucks: points.filter((p) => p.status === "ACTIVE").length,
        queryTimestamp: new Date().toISOString(),
      },
      data: points,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch TCB truck locations" },
      { status: 500 }
    );
  }
}
