import { useCallback, useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";

function Sample({ cta }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [videos, setVideos] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const pausedTimeRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [questionTimes, setQuestionTimes] = useState([]);

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const userIdRef = useRef(userId);
  const isCorrectRef = useRef(isCorrect);
  const isModalOpenRef = useRef(isModalOpen);
  const selectedQuestions = useRef([]);

  const questions = [
    {
      time: 100, // Sorunun gösterileceği video süresi (saniye)
      question:
        "Hastaların yatak başı derecelerinden hangisinde basınç yaralanma riski daha azdır?",
      options: ["30°", "60°", "90°"],
      correct: 0, // Doğru cevap: 30°
    },
    {
      time: 120,
      question:
        "Sırtüstü yatar pozisyonda yatan hastalarda, kaç saatte bir pozisyon değişikliği gerekmektedir?",
      options: [
        "En az iki saatte bir",
        "Dört altı saatte bir",
        "Gün içerisinde iki veya üç kez",
      ],
      correct: 0, // Doğru cevap: En az iki saatte bir
    },
    {
      time: 130,
      question: "Havalı yataklarla ilgili doğru olan seçeneği işaretleyiniz?",
      options: [
        "Havalı yatağın basıncı her hasta için aynıdır.",
        "Havalı yatak kullanan hastada düzenli pozisyon değişikliği gerekir.",
        "Basınç yaralanmalarının gelişmesini tamamen önler.",
      ],
      correct: 1, // Doğru cevap: Havalı yatak kullanan hastada düzenli pozisyon değişikliği gerekir.
    },
    {
      time: 140,
      question:
        "Deri bakımına yönelik aşağıdaki ifadelerden doğru seçeneği işaretleyiniz.",
      options: [
        "Kuru cilde pudra uygulanmalıdır.",
        "Kuru cilt nemlendirilmelidir.",
        "Kuru cilt su ve sabunla sürekli temizlenmelidir.",
      ],
      correct: 1, // Doğru cevap: Kuru cilt nemlendirilmelidir.
    },
    {
      time: 150,
      question:
        "1.aşama basınç yaralanmaları ile ilgili doğru seçeneği işaretleyiniz.",
      options: [
        "Deride gözle görünür deri kaybı, içi sıvı dolu kabarcıklar vardır.",
        "Deride özellikle topuklarda basmakla solmayan mor, koyu kestane renginde bir görüntü vardır.",
        "Deride basmakla solmayan kırmızılık vardır.",
      ],
      correct: 2, // Doğru cevap: Deride basmakla solmayan kırmızılık vardır.
    },
    {
      time: 200,
      question:
        "Sırtüstü yatış pozisyonunda en sık basınç yaralanması gelişen bölge neresidir?",
      options: ["Kuyruk sokumu", "Dizler", "Yanaklar"],
      correct: 0, // Doğru cevap: Kuyruk sokumu
    },
    {
      time: 210,
      question: "Yetersiz beslenme basınç yaralanmasına neden olur?",
      options: ["Doğru", "Yanlış"],
      correct: 0, // Doğru cevap: Doğru
    },
    {
      time: 220,
      question:
        "Kansızlığı olan hastalarda, olmayan hastalara göre, basınç yaralanması gelişme ihtimali daha yüksektir.",
      options: ["Doğru", "Yanlış"],
      correct: 0, // Doğru cevap: Doğru
    },
    {
      time: 230,
      question:
        "Yatakta hareketsiz kalmak basınç yaralanması riskini artırabilir.",
      options: ["Doğru", "Yanlış"],
      correct: 0, // Doğru cevap: Doğru
    },
    {
      time: 240,
      question:
        "Cildin nemli olması (ıslak, terli veya ıslak) bası yaralanması riskini etkilemez.",
      options: ["Doğru", "Yanlış"],
      correct: 1, // Doğru cevap: Yanlış
    },
  ];

  useEffect(() => {
    getAllVideos();
  }, []);

  useEffect(() => {
    userIdRef.current = userId; // userId güncellendiğinde ref'i de güncelle.
  }, [userId]);

  useEffect(() => {
    isCorrectRef.current = isCorrect;
  }, [isCorrect]);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  useEffect(() => {
    // 10 sorudan rastgele 2 soru seçelim
    const randomIndices = [];
    while (selectedQuestions.current.length < 2) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      if (!randomIndices.includes(randomIndex)) {
        randomIndices.push(randomIndex);
        selectedQuestions.current.push(questions[randomIndex]);
      }
    }

    // Seçilen soruların zamanlarını belirle
    setQuestionTimes(selectedQuestions.current.map((q) => q.time));
  }, []);

  const handleTimeUpdate = (currentTime, videoElement) => {
    const roundedTime = Math.floor(currentTime);
    const question = selectedQuestions.current.find(
      (q) => q.time === roundedTime
    );

    if (question && !isQuestionVisible) {
      setCurrentQuestion(question);
      console.log("Soru gösterilecek saniye:", currentTime);
      pausedTimeRef.current = Math.floor(currentTime);
      setIsQuestionVisible(true);
      videoElement.pause(); // Video duraklatılır
    }
  };

  const handleVideoPlayAttempt = useCallback(
    (streamInfo, index) => {
      const currentUserId = userIdRef.current;
      if (!videoRefs.current[index]) {
        return;
      }
      console.log({
        isCorrect: isCorrectRef.current,
        isModalOpen: isModalOpenRef.current,
        userId: currentUserId,
      });
      if (!currentUserId && !isCorrectRef.current) {
        !isModalOpenRef.current && setIsModalOpen(true);
        videoRefs.current[index].pause();
      }

      if (isCorrectRef.current) {
        videoRefs.current[index].play();
      }
    },
    [isCorrect, isModalOpen, userId]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
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

  const updateUserWatchedVideos = (streamInfoUpdate) => {
    console.log("streamInfoUpdate", { streamInfoUpdate });
    if (
      !streamInfoUpdate.id &&
      videoRefs.current[streamInfoUpdate.index].getCurrentTime() < 1
    ) {
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

  const handleAnswer = (selectedOptionIndex) => {
    // Aktif videoyu bul
    const videoElement = videoRefs.current[activeVideoIndex];
    
    console.log("Cevap verilen video:", activeVideoIndex);
    console.log("Duraklatılan zaman:", pausedTimeRef.current);

    if (currentQuestion.correct === selectedOptionIndex) {
      console.log("Doğru cevap!");
      setIsQuestionVisible(false);
      
      if (videoElement) {
        setTimeout(() => {
          videoElement.setCurrentTime(pausedTimeRef.current + 1);
          videoElement.play();
        }, 2000);
      }
    } else {
      console.log("Yanlış cevap!");
    }
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
                    setActiveVideoIndex(index);
                    handleVideoPlayAttempt(item, index);
                  }}
                  onPause={(currentTime, duration) => {
                    updateUserWatchedVideos({
                      index: index,
                      id: userIdRef.current,
                      streamInfo: {
                        videoBaslik: item.videoName,
                        izledigiSure: formatTime(currentTime),
                        tamanlanmaDurumu:
                          (currentTime / duration) * 100 <= 95 ? false : true,
                      },
                    });
                  }}
                  onTimeUpdate={(currentTime, videoElement) =>
                    handleTimeUpdate(currentTime, videoElement)
                  }
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
