import { useCallback, useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";

function Sample({ cta }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [videos, setVideos] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);

  const [userId, setUserId] = useState(null);
  const videoRefs = useRef([]);

  const questions = [
    {
      time: 10, // Sorunun gösterileceği video süresi (saniye)
      question:
        "Hastaların yatak başı derecelerinden hangisinde basınç yaralanma riski daha azdır?",
      options: ["30°", "60°", "90°"],
      correct: 0,
    },
    {
      time: 20,
      question:
        "Sırtüstü yatar pozisyonda yatan hastalarda, kaç saatte bir pozisyon değişikliği gerekmektedir?",
      options: [
        "En az iki saatte bir",
        "Dört altı saatte bir",
        "Gün içerisinde iki veya üç kez",
      ],
      correct: 0,
    },
    // Diğer soruları buraya ekleyin
  ];

  useEffect(() => {
    getAllVideos();
  }, []);

  const handleVideoPlayAttempt = (streamInfo, index, userId) => {
    console.log("handleVideoPlayAttempt", { streamInfo, index, userId });
    if (!videoRefs.current[index]) {
      return;
    }
    console.log("cart");
    if (!canPlay && !isCorrect) {
      !isModalOpen && setIsModalOpen(true);
      videoRefs.current[index].pause();
    }

    if (isCorrect) {
      videoRefs.current[index].play();
    }
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    if (isCorrect) {
      setCanPlay(true);
    }
  }, []);

  const getAllVideos = () => {
    const videosUrl = "https://basincyaralanmasinionle.xyz/getAllVideos";
    fetch(videosUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("videos data:", data);
        const sortedVideos = data.sort((a, b) => a.id - b.id);
        setVideos(sortedVideos);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const updateUserWatchedVideos = (index, streamInfoUpdate) => {
    console.log("streamInfoUpdate.id", streamInfoUpdate.id);
    if (!streamInfoUpdate.id && videoRefs.current[index].getCurrentTime() < 1) {
      return;
    }

    fetch(`https://basincyaralanmasinionle.xyz/updateWatchedList`, {
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

  const formatTime = (seconds) => {
    const secNum = parseInt(seconds, 10); // Saniye değerini tam sayıya çevirir
    const hours = Math.floor(secNum / 3600); // Saat
    const minutes = Math.floor((secNum - hours * 3600) / 60); // Dakika
    const secs = secNum - hours * 3600 - minutes * 60; // Saniye

    // Saat, dakika ve saniye değerlerini çift haneli olacak şekilde formatla
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = secs < 10 ? `0${secs}` : secs;

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <>
      {videos.map((item, index) => (
        <section className="section px-1" key={item.id}>
          <div className="section container rounded-xl shadow">
            <div className="row mx-auto items-center justify-center">
              <div className="md:col-6 lg:col-6">
                <VideoPlayer
                  ref={(el) => (videoRefs.current[index] = el)}
                  options={{
                    autoplay: false,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    experimentalSvgIcons: true,
                    sources: [
                      {
                        src: `https://basincyaralanmasinionle.xyz/${item.url}`,
                        type: "application/dash+xml",
                      },
                    ],
                  }}
                  onReady={(player) => {
                    player.autoplay();
                  }}
                  onPlay={() => {
                    handleVideoPlayAttempt(item, index, userId);
                  }}
                  onPause={(currentTime, duration) => {
                    updateUserWatchedVideos(index, {
                      index: index,
                      id: userId,
                      streamInfo: {
                        videoBaslik: item.videoName,
                        izledigiSure: formatTime(currentTime),
                        tamanlanmaDurumu:
                          (currentTime / duration) * 100 <= 95 ? false : true,
                      },
                    });
                  }}
                />
                {isQuestionVisible && (
                  <div
                    style={{
                      position: "fixed",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "white",
                      border: "1px solid black",
                      padding: "20px",
                      zIndex: 1000,
                    }}
                  >
                    <p>{currentQuestion.question}</p>
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        style={{
                          display: "block",
                          margin: "10px 0",
                          padding: "10px",
                          background: "#f0f0f0",
                          border: "1px solid #ccc",
                          cursor: "pointer",
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
                {isModalOpen && (
                  <Modal
                    onClose={closeModal}
                    setIsCorrect={setIsCorrect}
                    setUserId={setUserId}
                  />
                )}
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

const Modal = ({ onClose, setIsCorrect, setUserId }) => {
  const [userName, setUserName] = useState("");

  const handleChangeUserName = (e) => {
    setUserName(e.target.value);
  };

  const handleCheck = () => {
    const getAllUsersUrl = "https://basincyaralanmasinionle.xyz/getAllUsers";

    fetch(getAllUsersUrl)
      .then((response) => response.json())
      .then((data) => {
        const res =
          data.filter(
            (t) =>
              t.username.toLowerCase().trim() === userName.toLowerCase().trim()
          ).length > 0;

        const user = data.find(
          (t) =>
            t.username.toLowerCase().trim() === userName.toLowerCase().trim()
        );

        res == true ? setIsCorrect(true) : setIsCorrect(false);
        user && setUserId(user.id);
        onClose();
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
          Giriş Yap
        </button>
      </div>
    </div>
  );
};

export default Sample;
