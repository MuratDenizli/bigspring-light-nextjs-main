import { markdownify } from "@lib/utils/textConverter";
import Image from "next/image";
import Link from "next/link";
import YoutubePlayer from "./YoutubePlayer";

function Sample({ cta }) {
    
    return (
        <section className="section px-1">
            <div className="section container rounded-xl shadow">
                <div className="row  mx-auto items-center justify-center">
                    <div className="md:col-6 lg:col-6">
                        <YoutubePlayer className="w-full" id="1P2-HLBQAjo" title="YouTube Video" width={325}
                            height={206} />
                    </div>
                    <div className="mt-5 text-center md:mt-0 md:text-left md:col-6 lg:col-5">
                        <h2>{cta?.title}</h2>
                        <p className="mt-6">{markdownify(cta?.subtitle)}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Sample;
