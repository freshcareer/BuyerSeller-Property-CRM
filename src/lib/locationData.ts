// ============================================================
// LOCATION HIERARCHY DATA — State → City → Preferred Area
// Source: OpenStreetMap Nominatim + 99acres / MagicBricks data
// ============================================================

export interface AreaOption {
  value: string;
  label: string;
}

export interface CityOption {
  value: string;
  label: string;
  areas: AreaOption[];
}

export interface StateOption {
  value: string;
  label: string;
  cities: CityOption[];
}

export const LOCATION_DATA: StateOption[] = [
  {
    value: 'gujarat',
    label: 'Gujarat',
    cities: [
      {
        value: 'ahmedabad',
        label: 'Ahmedabad',
        areas: [
          // West / SG Highway (Premium)
          { value: 'satellite',     label: 'Satellite' },
          { value: 'prahlad_nagar', label: 'Prahlad Nagar' },
          { value: 'bodakdev',      label: 'Bodakdev' },
          { value: 'vastrapur',     label: 'Vastrapur' },
          { value: 'thaltej',       label: 'Thaltej' },
          { value: 'bopal',         label: 'Bopal' },
          { value: 'south_bopal',   label: 'South Bopal (SoBo)' },
          { value: 'ambli',         label: 'Ambli' },
          { value: 'shela',         label: 'Shela' },
          { value: 'sg_highway',    label: 'S.G. Highway' },
          // North
          { value: 'gota',          label: 'Gota' },
          { value: 'chandkheda',    label: 'Chandkheda' },
          { value: 'motera',        label: 'Motera' },
          { value: 'sabarmati',     label: 'Sabarmati' },
          { value: 'sola',          label: 'Sola' },
          { value: 'ghatlodia',     label: 'Ghatlodia' },
          // Central
          { value: 'navrangpura',   label: 'Navrangpura' },
          { value: 'naranpura',     label: 'Naranpura' },
          { value: 'cg_road',       label: 'C.G. Road' },
          { value: 'paldi',         label: 'Paldi' },
          { value: 'vejalpur',      label: 'Vejalpur' },
          // South / East
          { value: 'maninagar',     label: 'Maninagar' },
          { value: 'narol',         label: 'Narol' },
          { value: 'vastral',       label: 'Vastral' },
          { value: 'nikol',         label: 'Nikol' },
          { value: 'naroda',        label: 'Naroda' },
          { value: 'vatva',         label: 'Vatva' },
          { value: 'odhav',         label: 'Odhav' },
        ],
      },
      {
        value: 'surat',
        label: 'Surat',
        areas: [
          { value: 'adajan',        label: 'Adajan' },
          { value: 'vesu',          label: 'Vesu' },
          { value: 'pal',           label: 'Pal' },
          { value: 'katargam',      label: 'Katargam' },
          { value: 'varachha',      label: 'Varachha' },
          { value: 'althan',        label: 'Althan' },
          { value: 'dumas',         label: 'Dumas Road' },
          { value: 'citylight',     label: 'City Light' },
          { value: 'udhna',         label: 'Udhna' },
          { value: 'magdalla',      label: 'Magdalla' },
        ],
      },
      {
        value: 'vadodara',
        label: 'Vadodara',
        areas: [
          { value: 'alkapuri',      label: 'Alkapuri' },
          { value: 'gotri',         label: 'Gotri' },
          { value: 'waghodia',      label: 'Waghodia Road' },
          { value: 'manjalpur',     label: 'Manjalpur' },
          { value: 'karelibaug',    label: 'Karelibaug' },
          { value: 'harni',         label: 'Harni Road' },
          { value: 'subhanpura',    label: 'Subhanpura' },
          { value: 'sayajiganj',    label: 'Sayajiganj' },
          { value: 'akota',         label: 'Akota' },
          { value: 'sama',          label: 'Sama' },
        ],
      },
      {
        value: 'rajkot',
        label: 'Rajkot',
        areas: [
          { value: 'kalawad_road',  label: 'Kalawad Road' },
          { value: 'amin_marg',     label: 'Amin Marg' },
          { value: 'yagnik_road',   label: 'Yagnik Road' },
          { value: 'gondal_road',   label: 'Gondal Road' },
          { value: 'raiya_road',    label: 'Raiya Road' },
          { value: 'mavdi',         label: 'Mavdi' },
          { value: 'university_road', label: 'University Road' },
          { value: 'bhaktinagar',   label: 'Bhaktinagar' },
        ],
      },
      {
        value: 'gandhinagar',
        label: 'Gandhinagar',
        areas: [
          { value: 'sector_1_30',   label: 'Sector 1–30' },
          { value: 'kudasan',       label: 'Kudasan' },
          { value: 'sargasan',      label: 'Sargasan' },
          { value: 'gift_city',     label: 'GIFT City' },
          { value: 'infocity',      label: 'Infocity' },
          { value: 'randesan',      label: 'Randesan' },
        ],
      },
      {
        value: 'anand',
        label: 'Anand',
        areas: [
          { value: 'vallabh_vidyanagar', label: 'Vallabh Vidyanagar' },
          { value: 'karamsad',      label: 'Karamsad' },
          { value: 'anand_town',    label: 'Anand Town' },
          { value: 'borsad',        label: 'Borsad' },
        ],
      },
      {
        value: 'mehsana',
        label: 'Mehsana',
        areas: [
          { value: 'mehsana_city',  label: 'Mehsana City' },
          { value: 'kherva',        label: 'Kherva' },
          { value: 'visnagar',      label: 'Visnagar' },
        ],
      },
      {
        value: 'bhavnagar',
        label: 'Bhavnagar',
        areas: [
          { value: 'waghawadi',     label: 'Waghawadi Road' },
          { value: 'ghogha',        label: 'Ghogha Road' },
          { value: 'bhavnagar_city', label: 'Bhavnagar City' },
        ],
      },
    ],
  },
];


/** Get cities for a given state value */
export function getCities(stateValue: string): CityOption[] {
  return LOCATION_DATA.find((s) => s.value === stateValue)?.cities ?? [];
}

/** Get areas for a given state + city value */
export function getAreas(stateValue: string, cityValue: string): AreaOption[] {
  return getCities(stateValue).find((c) => c.value === cityValue)?.areas ?? [];
}
