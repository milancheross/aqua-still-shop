export interface StandardCmsPage {
  slug: string;
  title: string;
  defaultDescription: string;
  defaultImage: string;
}

/**
 * Standardne sistemske stranice prodavnice koje se mogu uređivati u CMS editoru.
 */
export const STANDARD_CMS_PAGES: StandardCmsPage[] = [
  {
    slug: "o-nama",
    title: "O nama",
    defaultDescription:
      "Aqua Still je prodavnica alata, vodovodnog materijala, kupatilske opreme, navodnjavanja, boja i druge opreme za kuću, radionicu i profesionalne projekte na Zlatiboru.",
    defaultImage: "/images/hero-1.webp",
  },
  {
    slug: "isporuka",
    title: "Isporuka i plaćanje",
    defaultDescription:
      "Izaberite brzu dostavu na kućnu adresu ili poručite online i preuzmite robu u našoj radnji na Zlatiboru narednog radnog dana.",
    defaultImage: "/images/hero-2.webp",
  },
  {
    slug: "reklamacije",
    title: "Reklamacije i povrat",
    defaultDescription:
      "Uputstvo za prijavu reklamacija, zamenu i povrat robe u skladu sa zakonskim propisima i garancijom proizvođača.",
    defaultImage: "/images/hero-3.webp",
  },
  {
    slug: "kontakt",
    title: "Kontakt",
    defaultDescription:
      "Kontaktirajte nas za sve informacije o dostupnosti artikala, tehničkim karakteristikama, cenama i lokaciji prodavnice na Zlatiboru.",
    defaultImage: "/images/hero-4.webp",
  },
  {
    slug: "politika-privatnosti",
    title: "Politika privatnosti",
    defaultDescription:
      "Aqua Still Zlatibor garantuje bezbednost vaših ličnih podataka prilikom posete našem sajtu i obavljanja online kupovine.",
    defaultImage: "/images/hero-1.webp",
  },
];

