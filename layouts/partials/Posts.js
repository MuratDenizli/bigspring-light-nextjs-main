import config from "@config/config.json";
import YoutubePlayer from "@layouts/components/YoutubePlayer";
import { plainify } from "@lib/utils/textConverter";
import Image from "next/image";
import Link from "next/link";

const Posts = ({ posts }) => {
  const { blog_folder, summary_length } = config.settings;
  return (
    <div className="section row pb-0">
      <div className="col-12 pb-12 lg:pb-24">
        <div className="row items-center">
          <div className="col-12 md:col-6">
            {posts[0].frontmatter.image && (
              // <Image
              //   className="h-auto w-full rounded-lg"
              //   src={posts[0].frontmatter.image}
              //   alt={posts[0].frontmatter.title}
              //   width={540}
              //   height={227}
              //   priority={true}
              // />
              <YoutubePlayer  width={540} height={227} id="C0DPdy98e4c" title="YouTube Video" />
            )}
          </div>
          <div className="col-12 md:col-6">
            <h2 className="h3 mb-2 mt-4">
              {/* <Link
                href={`/${blog_folder}/${posts[0].slug}`}
                className="block hover:text-primary"
              >
                {posts[0].frontmatter.title}
              </Link> */}
            </h2>
            <p className="text-text">
              {plainify(
                posts[0].content?.slice(0, Number(summary_length)),
                "div"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;
