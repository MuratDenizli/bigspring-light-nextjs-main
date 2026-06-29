import config from "@config/config.json";
import Base from "@layouts/Baseof";
import { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaRegCircle,
  FaSearch,
  FaUserGraduate,
  FaVideo,
} from "react-icons/fa";

const API = "https://api.basincyaralanmasinionle.com";

/* ---------- yardımcı fonksiyonlar ---------- */

// "HH:MM:SS" veya "MM:SS" formatındaki süreyi saniyeye çevirir
const sureToSaniye = (sure) => {
  if (!sure || typeof sure !== "string") return 0;
  const parts = sure.split(":").map((p) => parseInt(p, 10) || 0);
  return parts.reduce((acc, val) => acc * 60 + val, 0);
};

// saniyeyi "X dk Y sn" / "X sa Y dk" şeklinde okunabilir hale getirir
const saniyeToOkunabilir = (sn) => {
  if (!sn) return "0 sn";
  const saat = Math.floor(sn / 3600);
  const dakika = Math.floor((sn % 3600) / 60);
  const saniye = Math.floor(sn % 60);
  if (saat > 0) return `${saat} sa ${dakika} dk`;
  if (dakika > 0) return `${dakika} dk ${saniye} sn`;
  return `${saniye} sn`;
};

// geçerli (boş olmayan) izleme kayıtlarını döndürür
const temizListe = (watchedList) =>
  Array.isArray(watchedList)
    ? watchedList.filter((w) => w && w.videoBaslik && w.videoBaslik.trim() !== "")
    : [];

/* ---------- istatistik kartı ---------- */

const StatKart = ({ icon, deger, etiket, renk }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
      style={{ backgroundColor: `${renk}1a`, color: renk }}
    >
      {icon}
    </div>
    <div>
      <div className="text-h3 font-bold leading-none text-dark">{deger}</div>
      <div className="mt-1 text-sm text-text">{etiket}</div>
    </div>
  </div>
);

/* ---------- ilerleme çubuğu ---------- */

const Ilerleme = ({ yuzde }) => (
  <div className="h-2.5 w-full overflow-hidden rounded-full bg-theme-light">
    <div
      className="h-full rounded-full transition-all duration-500"
      style={{
        width: `${yuzde}%`,
        background:
          yuzde >= 100
            ? "linear-gradient(90deg,#0aa8a7,#16c79a)"
            : "linear-gradient(90deg,#0aa8a7,#3ec9c8)",
      }}
    />
  </div>
);

/* ---------- tek hasta satırı ---------- */

const HastaKart = ({ hasta, videolar }) => {
  const [acik, setAcik] = useState(false);

  const liste = temizListe(hasta.watchedList);
  const izlenenMap = new Map(liste.map((w) => [w.videoBaslik, w]));

  // tüm videolar üzerinden hastanın durumunu birleştir
  const satirlar = videolar.map((v) => {
    const kayit = izlenenMap.get(v.videoName);
    return {
      videoName: v.videoName,
      sure: kayit ? kayit.izledigiSure : null,
      tamamlandi: kayit ? !!kayit.tamanlanmaDurumu : false,
      baslandi: !!kayit,
    };
  });

  const toplamVideo = videolar.length || satirlar.length;
  const tamamlanan = satirlar.filter((s) => s.tamamlandi).length;
  const yuzde = toplamVideo ? Math.round((tamamlanan / toplamVideo) * 100) : 0;
  const toplamSure = liste.reduce((acc, w) => acc + sureToSaniye(w.izledigiSure), 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* başlık satırı */}
      <button
        onClick={() => setAcik((a) => !a)}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-theme-light text-lg font-bold text-primary">
          {hasta.username?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-dark">
              {hasta.username || "İsimsiz Hasta"}
            </span>
            {yuzde >= 100 && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Tamamlandı
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="max-w-[260px] flex-1">
              <Ilerleme yuzde={yuzde} />
            </div>
            <span className="shrink-0 text-sm font-medium text-text">
              {tamamlanan}/{toplamVideo} video
            </span>
          </div>
        </div>

        <div className="hidden shrink-0 text-right sm:block">
          <div className="text-h4 font-bold text-primary">%{yuzde}</div>
          <div className="flex items-center justify-end gap-1 text-xs text-text">
            <FaClock /> {saniyeToOkunabilir(toplamSure)}
          </div>
        </div>

        <FaChevronDown
          className={`shrink-0 text-text transition-transform ${
            acik ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* detay */}
      {acik && (
        <div className="border-t border-border bg-theme-light/40 px-5 py-4">
          <div className="space-y-2">
            {satirlar.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3"
              >
                {s.tamamlandi ? (
                  <FaCheckCircle className="shrink-0 text-green-500" />
                ) : (
                  <FaRegCircle className="shrink-0 text-gray-300" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-dark">
                  {s.videoName}
                </span>
                {s.baslandi ? (
                  <span className="shrink-0 text-sm font-medium text-text">
                    {s.sure}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs italic text-gray-400">
                    İzlenmedi
                  </span>
                )}
              </div>
            ))}
            {satirlar.length === 0 && (
              <p className="py-2 text-center text-sm text-text">
                Henüz izleme kaydı yok.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- ana sayfa ---------- */

const Takip = () => {
  const [hastalar, setHastalar] = useState([]);
  const [videolar, setVideolar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

  const [arama, setArama] = useState("");
  const [filtre, setFiltre] = useState("hepsi"); // hepsi | tamamlandi | devam
  const [sirala, setSirala] = useState("ilerleme"); // ilerleme | isim

  useEffect(() => {
    let iptal = false;
    const veriGetir = async () => {
      try {
        setYukleniyor(true);
        const [uRes, vRes] = await Promise.all([
          fetch(`${API}/getAllUsers`),
          fetch(`${API}/getAllVideos`),
        ]);
        if (!uRes.ok || !vRes.ok) throw new Error("Veri alınamadı");
        const [users, vids] = await Promise.all([uRes.json(), vRes.json()]);
        if (iptal) return;
        setHastalar(Array.isArray(users) ? users : []);
        setVideolar(
          Array.isArray(vids) ? [...vids].sort((a, b) => a.id - b.id) : []
        );
        setHata(null);
      } catch (e) {
        if (!iptal) setHata(e.message || "Bir hata oluştu");
      } finally {
        if (!iptal) setYukleniyor(false);
      }
    };
    veriGetir();
    return () => {
      iptal = true;
    };
  }, []);

  // hesaplanmış değerler
  const { gosterilen, ozet } = useMemo(() => {
    const toplamVideo = videolar.length;

    const zenginlestir = hastalar.map((h) => {
      const liste = temizListe(h.watchedList);
      const tamamlanan = liste.filter((w) => w.tamanlanmaDurumu).length;
      const yuzde = toplamVideo
        ? Math.round((tamamlanan / toplamVideo) * 100)
        : 0;
      const sure = liste.reduce((a, w) => a + sureToSaniye(w.izledigiSure), 0);
      return { ...h, _yuzde: yuzde, _tamamlanan: tamamlanan, _sure: sure };
    });

    // özet istatistikler
    const ozet = {
      hastaSayisi: zenginlestir.length,
      videoSayisi: toplamVideo,
      tamamlayan: zenginlestir.filter(
        (h) => toplamVideo > 0 && h._tamamlanan >= toplamVideo
      ).length,
      ortalama: zenginlestir.length
        ? Math.round(
            zenginlestir.reduce((a, h) => a + h._yuzde, 0) /
              zenginlestir.length
          )
        : 0,
    };

    let gosterilen = zenginlestir.filter((h) =>
      (h.username || "").toLowerCase().includes(arama.toLowerCase().trim())
    );

    if (filtre === "tamamlandi")
      gosterilen = gosterilen.filter((h) => h._yuzde >= 100);
    if (filtre === "devam")
      gosterilen = gosterilen.filter((h) => h._yuzde < 100);

    gosterilen.sort((a, b) =>
      sirala === "isim"
        ? (a.username || "").localeCompare(b.username || "", "tr")
        : b._yuzde - a._yuzde
    );

    return { gosterilen, ozet };
  }, [hastalar, videolar, arama, filtre, sirala]);

  return (
    <Base title="Hasta İzleme Takibi">
      {/* hero */}
      <section
        className="py-14"
        style={{
          background:
            "linear-gradient(135deg,#0aa8a7 0%,#0f8b8a 60%,#0a6e6d 100%)",
        }}
      >
        <div className="container">
          <p className="text-sm font-medium uppercase tracking-wider text-white/70">
            Eğitim Paneli
          </p>
          <h1 className="mt-2 text-h2 font-bold text-white sm:text-h1">
            Hasta İzleme Takibi
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Hastaların eğitim videolarını ne kadar izlediğini ve tamamlama
            durumlarını tek ekrandan takip edin.
          </p>
        </div>
      </section>

      <section className="section -mt-10">
        <div className="container">
          {/* özet kartlar */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatKart
              icon={<FaUserGraduate />}
              deger={ozet.hastaSayisi}
              etiket="Toplam Hasta"
              renk="#0aa8a7"
            />
            <StatKart
              icon={<FaVideo />}
              deger={ozet.videoSayisi}
              etiket="Eğitim Videosu"
              renk="#6366f1"
            />
            <StatKart
              icon={<FaCheckCircle />}
              deger={ozet.tamamlayan}
              etiket="Tümünü Tamamlayan"
              renk="#16a34a"
            />
            <StatKart
              icon={<FaClock />}
              deger={`%${ozet.ortalama}`}
              etiket="Ortalama Tamamlama"
              renk="#f59e0b"
            />
          </div>

          {/* kontroller */}
          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text" />
              <input
                type="text"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="Hasta ara..."
                className="w-full rounded-full border border-border bg-white py-3 pl-11 pr-4 text-dark focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { k: "hepsi", l: "Tümü" },
                { k: "devam", l: "Devam Eden" },
                { k: "tamamlandi", l: "Tamamlayan" },
              ].map((f) => (
                <button
                  key={f.k}
                  onClick={() => setFiltre(f.k)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filtre === f.k
                      ? "bg-primary text-white"
                      : "bg-white text-text hover:bg-theme-light"
                  }`}
                >
                  {f.l}
                </button>
              ))}
              <select
                value={sirala}
                onChange={(e) => setSirala(e.target.value)}
                className="rounded-full border border-border bg-white py-2 pl-4 pr-8 text-sm text-dark focus:border-primary focus:ring-primary"
              >
                <option value="ilerleme">İlerlemeye göre</option>
                <option value="isim">İsme göre</option>
              </select>
            </div>
          </div>

          {/* içerik */}
          <div className="mt-6">
            {yukleniyor && (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-2xl bg-theme-light"
                  />
                ))}
              </div>
            )}

            {!yukleniyor && hata && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
                <p className="font-medium text-red-600">{hata}</p>
                <p className="mt-1 text-sm text-text">
                  Sunucuya ulaşılamadı, lütfen daha sonra tekrar deneyin.
                </p>
              </div>
            )}

            {!yukleniyor && !hata && gosterilen.length === 0 && (
              <div className="rounded-2xl border border-border bg-white p-12 text-center">
                <FaUserGraduate className="mx-auto text-4xl text-border" />
                <p className="mt-3 font-medium text-dark">Sonuç bulunamadı</p>
                <p className="mt-1 text-sm text-text">
                  Arama veya filtre kriterlerini değiştirmeyi deneyin.
                </p>
              </div>
            )}

            {!yukleniyor && !hata && gosterilen.length > 0 && (
              <div className="space-y-3">
                {gosterilen.map((h) => (
                  <HastaKart key={h.id} hasta={h} videolar={videolar} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Base>
  );
};

export default Takip;
