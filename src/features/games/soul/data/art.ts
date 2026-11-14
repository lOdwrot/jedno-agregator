/**
 * Illustrations (public-domain / free-licensed images from Wikimedia Commons) for cards and pack fronts.
 * Files live in `public/soul/art/<key>.webp`; cards without an entry keep their emoji art.
 */
export interface ArtCredit {
  title: string;
  author: string;
  license: string;
  url: string;
  /** Vertical focus of the crop, 0 = top, 1 = bottom (faces are usually near the top). */
  focus?: number;
}

export const ART: Record<string, ArtCredit> = {
  franciszek: {
    title: "Pope Francis in March 2013.jpg",
    author: "Casa Rosada",
    license: "CC BY-SA 2.0",
    url: "https://commons.wikimedia.org/wiki/File:Pope_Francis_in_March_2013.jpg",
    focus: 0.25,
  },
  grzegorz1: {
    title:
      "British (English) School - One of the Four Doctors of the Western Church, Pope Gregory I (the 'Great') (c.540–604) - 1430443 - National Trust.jpg",
    author: "anonymous",
    license: "domena publiczna",
    url: "https://commons.wikimedia.org/wiki/File:British_(English)_School_-_One_of_the_Four_Doctors_of_the_Western_Church,_Pope_Gregory_I_(the_%27Great%27)_(c.540%E2%80%93604)_-_1430443_-_National_Trust.jpg",
    focus: 0.2,
  },
  innocenty11: {
    title: "Portrait of Pope Innocent XI Odescalchi (by Jacob Ferdinand Voet).jpg",
    author: "Jacob Ferdinand Voet",
    license: "domena publiczna",
    url: "https://commons.wikimedia.org/wiki/File:Portrait_of_Pope_Innocent_XI_Odescalchi_(by_Jacob_Ferdinand_Voet).jpg",
    focus: 0.2,
  },
  jan23: {
    title: "Pope John XXIII - 1959 (cropped).jpg",
    author: "Unknown authorUnknown author",
    license: "domena publiczna",
    url: "https://commons.wikimedia.org/wiki/File:Pope_John_XXIII_-_1959_(cropped).jpg",
    focus: 0.25,
  },
  jp2: {
    title: "Jan Paweł II portret Z. Kotyłło.jpg",
    author: "Zbigniew Kotyłło",
    license: "CC BY-SA 3.0",
    url: "https://commons.wikimedia.org/wiki/File:Jan_Pawe%C5%82_II_portret_Z._Koty%C5%82%C5%82o.jpg",
    focus: 0.2,
  },
  leon1: {
    title: "Raphael - The Meeting of Leo the Great and Attila.jpg",
    author: "Raphael",
    license: "domena publiczna",
    url: "https://commons.wikimedia.org/wiki/File:Raphael_-_The_Meeting_of_Leo_the_Great_and_Attila.jpg",
    focus: 0.3,
  },
  mariacka: {
    title: "Bazylika Mariacka DSC01870.jpg",
    author: "Gyddanyzc",
    license: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Bazylika_Mariacka_DSC01870.jpg",
    focus: 0.4,
  },
  oliwa: {
    title: "Oliwa Cathedral, great organ.jpg",
    author: "Gerda Arendt",
    license: "CC0",
    url: "https://commons.wikimedia.org/wiki/File:Oliwa_Cathedral,_great_organ.jpg",
    focus: 0.4,
  },
  piotr: {
    title: "Pope-peter pprubens.jpg",
    author: "Peter Paul Rubens",
    license: "domena publiczna",
    url: "https://commons.wikimedia.org/wiki/File:Pope-peter_pprubens.jpg",
    focus: 0.15,
  },
  pius10: {
    title: "His Holiness Pope St. Pius X – edited.jpg",
    author: "Unknown authorUnknown author",
    license: "domena publiczna",
    url: "https://commons.wikimedia.org/wiki/File:His_Holiness_Pope_St._Pius_X_%E2%80%93_edited.jpg",
    focus: 0.25,
  },
  popieluszko: {
    title: "Jerzy Popieluszko.jpg",
    author: "Unknown authorUnknown author",
    license: "domena publiczna",
    url: "https://commons.wikimedia.org/wiki/File:Jerzy_Popieluszko.jpg",
    focus: 0.2,
  },
  wojciech: {
    title: "Szt-adalbert.jpg",
    author: "Mihály Kovács",
    license: "domena publiczna",
    url: "https://commons.wikimedia.org/wiki/File:Szt-adalbert.jpg",
    focus: 0.2,
  },
};

export function artSrc(key: string): string | null {
  return ART[key] ? `${import.meta.env.BASE_URL}soul/art/${key}.webp` : null;
}
