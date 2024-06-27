import { markdownify } from "@lib/utils/textConverter";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function Sample({ cta }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const videoRef = useRef(null);

  const handleVideoPlayAttempt = (event) => {
    console.log("canPlay", canPlay);
    console.log("isCorrect", isCorrect);
    if (!canPlay && !isCorrect) {
      event.preventDefault();
      !isModalOpen && setIsModalOpen(true);
      videoRef.current.pause();
    }
    console.log("canPlay LEvel2", canPlay);
    console.log("isCorrect Level2", isCorrect);
    if (isCorrect) {
      videoRef.current.play();
    }
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    console.log("closeModal isCorrect", isCorrect);
    if (isCorrect) {
      setCanPlay(true);
    }
  }, []);

  return (
    <section className="section px-1">
      <div className="section container rounded-xl shadow">
        <div className="row  mx-auto items-center justify-center">
          <div className="md:col-6 lg:col-6">
            <video
              ref={videoRef}
              className="mx-auto mt-6"
              width={1000}
              height={500}
              controls
              preload="true"
              onPlay={handleVideoPlayAttempt}
            >
              <source
                src="https://198.7.112.94:8080/ders1.mp4"
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
            <h2>{cta?.title}</h2>
            <p className="mt-6">{markdownify(cta?.subtitle)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const Modal = ({ isOpen, onClose, setIsCorrect }) => {
  const [userName, setUserName] = useState("");

  const handleChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const handleCheck = () => {
    const getAllUsersUrl = "https://198.7.112.94:8080/getAllUsers";

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
