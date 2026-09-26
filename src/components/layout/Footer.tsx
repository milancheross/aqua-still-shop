import Link from "next/link";
import { Droplets, Mail, Phone, MapPin, MessageSquare, Share2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase">
                Aqua<span className="text-blue-500">Still</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Vaš pouzdan partner za vodovod, alate, kupatilsku opremu i sisteme za navodnjavanje na Zlatiboru i šire. Kvalitet i iskustvo od poverenja.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white transition-colors">
                <MessageSquare className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Brzi linkovi</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/katalog" className="hover:text-white hover:underline transition-all">Svi proizvodi</Link></li>
              <li><Link href="/katalog/alati" className="hover:text-white hover:underline transition-all">Alati i oprema</Link></li>
              <li><Link href="/katalog/vodovod" className="hover:text-white hover:underline transition-all">Vodovod i kanalizacija</Link></li>
              <li><Link href="/katalog/kupatila" className="hover:text-white hover:underline transition-all">Kupatilska oprema</Link></li>
              <li><Link href="/katalog/navodnjavanje" className="hover:text-white hover:underline transition-all">Navodnjavanje</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-bold mb-6">Korisnička podrška</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/o-nama" className="hover:text-white transition-all">O nama</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition-all">Kontakt</Link></li>
              <li><Link href="/isporuka" className="hover:text-white transition-all">Isporuka i plaćanje</Link></li>
              <li><Link href="/reklamacije" className="hover:text-white transition-all">Reklamacije</Link></li>
              <li><Link href="/politika-privatnosti" className="hover:text-white transition-all">Politika privatnosti</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-bold mb-6">Kontakt podaci</h3>
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
              <span>Magistralni put bb,<br />31315 Zlatibor, Srbija</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="w-5 h-5 text-blue-500 shrink-0" />
              <span>+381 31 123 456</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="w-5 h-5 text-blue-500 shrink-0" />
              <span>info@aquastill-zlatibor.rs</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
          <p>© {currentYear} Aqua Still Zlatibor. Sva prava zadržana.</p>
          <div className="flex space-x-6 uppercase tracking-tighter">
            <span>PIB: 123456789</span>
            <span>Matični broj: 01234567</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
