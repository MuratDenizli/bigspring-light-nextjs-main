import config from "@config/config.json";
import Base from "@layouts/Baseof";
import Cta from "@layouts/components/Cta";
import { markdownify } from "@lib/utils/textConverter";
import Image from "next/image";
import Link from "next/link";
import { Autoplay, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.min.css";
import { getListPage } from "../lib/contentParser";

const Home = ({ frontmatter }) => {
  const { banner, feature, services, workflow, call_to_action } = frontmatter;
  const { title } = config.site;

  return (
    <Base title={title}>
      {/* Banner */}
      <section className="section pb-[50px]">
        <div className="container">
          <div className="row text-center">
            <div className="mx-auto lg:col-10">
              {/* <h1 className="font-primary font-bold">{banner.title}</h1> */}
              <p className="mt-4" style={{ color: "black", fontSize: "20px" }}>
                {markdownify(banner.content)}
              </p>
              {/* {banner.button.enable && (
                <Link
                  className="btn btn-primary mt-4"
                  href={banner.button.link}
                  rel={banner.button.rel}
                >
                  {banner.button.label}
                </Link>
              )} */}
              {/* <Image
                className="mx-auto mt-12"
                src={banner.image}
                width={750}
                height={390}
                alt="banner image"
                priority
              /> */}
              <video
                className="mx-auto mt-6"
                width={1000}
                height={500}
                controls
                preload="true"
              >
                <source src="/videos/bizkimiz.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      {/* <section className="section bg-theme-light">
        <div className="container">
          <div className="text-center">
            <h2>Biz Kimiz?</h2>
            <h4 className="mt-4">Araştırmacılarımızı tanıyalım </h4>
            <p className="mt-4" style={{ color: "black", fontSize: "20px" }}>
              Sorumlu araştırmacı Uzm. Hem. Şerife Kelle Dikbaş ve tez danışmanı
              Prof. Dr. Funda Büyükyılmaz.
            </p>
            <p className="mt-4" style={{ color: "black", fontSize: "20px" }}>
              Araştırmacılarımızı tanımak için aşağıda bir video yer almaktadır.
            </p>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-6">
            {feature.features.map((item, i) => (
              <div
                className="feature-card rounded-xl bg-white p-5 pb-8 text-center"
                key={`feature-${i}`}
              >
                {item.icon && (
                  <Image
                    className="mx-auto"
                    src={item.icon}
                    width={30}
                    height={30}
                    alt=""
                  />
                )}
                <div className="mt-4">
                  {markdownify(item.name, "h3", "h5")}
                  <p className="mt-3">{item.content}</p>
                </div>
              </div>
            ))} 
            <video
              className="mx-auto mt-6"
              width={1000}
              height={500}
              controls
              preload="true"
            >
              <source src="/videos/tanıtım.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section> */}
    </Base>
  );
};

export const getStaticProps = async () => {
  const homePage = await getListPage("content/_index.md");
  const { frontmatter } = homePage;
  return {
    props: {
      frontmatter,
    },
  };
};

export default Home;
