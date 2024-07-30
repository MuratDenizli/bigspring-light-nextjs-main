import { markdownify } from "@lib/utils/textConverter";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function Sample({ cta }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [videos, setVideos] = useState([]);
  const [index, setIndex] = useState(0);

  const videoRefs = useRef([]);

  useEffect(() => {
    getAllVideos();
  }, []);

  useEffect(() => {
    if (isCorrect) {
      handleVideoPlayAttempt(index);
    }
  }, [isCorrect]);

  const handleVideoPlayAttempt = (streamInfo,index) => {
    setIndex(index);

    if (!videoRefs.current[index]) {
      return;
    }
    if (!canPlay && !isCorrect) {
      !isModalOpen && setIsModalOpen(true);
      videoRefs.current[index].pause();
    }

    if (isCorrect) {
      console.log("Level4", index);

      videoRefs.current[index].play();
      updateUserWatchedVideos(streamInfo);
    }
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    if (isCorrect) {
      setCanPlay(true);
    }
  }, []);

  const getAllVideos = () => {
    const videosUrl = "https://featurebase.com.tr/getAllVideos";
    fetch(videosUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("videos data:", data);
        setVideos(data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const updateUserWatchedVideos = () => {
    const userId = "1";
    const streamInfoUpdate = {
      id: userId,
      streamInfo: {
        videoBaslik: streamInfo.videoBaslik,
        izledigiSure: "00:15:30",
        tamanlanmaDurumu: false,
      },
    };

    fetch(`https://featurebase.com.tr/updateWatchedList`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(streamInfoUpdate),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <>
      {videos.map((item, index) => (
        <section className="section px-1" key={item.id}>
          <div className="section container rounded-xl shadow">
            <div className="row  mx-auto items-center justify-center">
              <div className="md:col-6 lg:col-6">
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="mx-auto mt-6"
                  width={1000}
                  height={500}
                  controls
                  preload="true"
                  onPlay={() => handleVideoPlayAttempt(item, index)}
                >
                  <source
                    src={`https://featurebase.com.tr/${item.url}.mp4`}
                    type="video/mp4"
                  />
                </video>
                <Modal
                  isOpen={isModalOpen}
                  onClose={closeModal}
                  setIsCorrect={setIsCorrect}
                />
              </div>
              <div className="mt-5 text-center md:col-6 lg:col-5 md:mt-0 md:text-left">
                <h2>{item.videoName}</h2>
                {/* <p className="mt-6">{markdownify(item.)}</p> */}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

const Modal = ({ isOpen, onClose, setIsCorrect }) => {
  const [userName, setUserName] = useState("");

  const handleChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const handleCheck = () => {
    const getAllUsersUrl = "https://featurebase.com.tr/getAllUsers";

    fetch(getAllUsersUrl)
      .then((response) => response.json())
      .then((data) => {
        const res =
          data.filter(
            (t) =>
              t.username.toLowerCase().trim() === userName.toLowerCase().trim()
          ).length > 0;

        console.log("res", res);
        res == true ? setIsCorrect(true) : setIsCorrect(false);
        onClose();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2 className="mb-5 text-center">
          Videoyu izleyebilmek için aşağıya isim soyisim girmelisiniz!
        </h2>
        <input
          type="text"
          placeholder="İsim Soyisim Giriniz"
          onChange={(e) => handleChangeUserName(e)}
        />
        <button className="btn btn-primary mx-auto mt-4" onClick={handleCheck}>
          Kontrol Et
        </button>
      </div>
    </div>
  );
};

export default Sample;
