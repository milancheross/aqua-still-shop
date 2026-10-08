import {
  Bath,
  Boxes,
  Cable,
  Droplets,
  Flame,
  Hammer,
  HardHat,
  Lightbulb,
  Paintbrush,
  Plug,
  Sprout,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function getCategoryIcon(value: string): LucideIcon {
  const text = normalize(value);

  if (/(alat|busil|brus|test|rez|merdev|rucni|elektricni)/.test(text)) return Hammer;
  if (/(boje|lak|farb|hemij|silikon|lepak|pur-pena)/.test(text)) return Paintbrush;
  if (/(gradev|zastit|radna obuca|oprema za rad)/.test(text)) return HardHat;
  if (/(grejan|radijator|kotao|pelet|term|toplot|ventilator)/.test(text)) return Flame;
  if (/(kupatil|sanitar|slavin|baterij|wc|kada|tus)/.test(text)) return Bath;
  if (/(navodnj|bast|dvorist|trav|cisc|kuc|voda za bast)/.test(text)) return Sprout;
  if (/(rasvet|elektro|kabl|utic|prekid|struj)/.test(text)) return Lightbulb;
  if (/(vodovod|kanaliz|fiting|spojnic|cev|crev|pump|odvod|ventil)/.test(text)) return Droplets;
  if (/(vijc|sraf|metal|anker|tipl|matica|podlosk)/.test(text)) return Wrench;
  if (/(konektor|mrez|zica|provod)/.test(text)) return Cable;
  if (/(uticnica|napaj|adapter)/.test(text)) return Plug;
  if (/(kutija|organiz|sklad|set)/.test(text)) return Boxes;

  return Wrench;
}
