document.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.getElementById("btn-mic");
  const sendBtn = document.getElementById("btn-send");
  const textInput = document.getElementById("text-input");
  const chatDisplay = document.getElementById("chat-display");
  

  const dashboardSection = document.getElementById("dashboard-section");
  const productsSection = document.getElementById("products-section");
  const settingsSection = document.getElementById("settings-section");
  
  
  const btnDashboard = document.getElementById("btn-dashboard");
  const btnProducts = document.getElementById("btn-products");
  const btnAppointments = document.getElementById("btn-appointments"); // Currently just logs or goes to chat
  const btnSettings = document.getElementById("btn-settings");
  const btnCallSupport = document.getElementById("btn-call-support");
  const btnBackProducts = document.getElementById("btn-back-products");

  function initThreeJS() {
      const container = document.getElementById('canvas-container');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      
      const geometry = new THREE.IcosahedronGeometry(1, 1);
      const material = new THREE.MeshPhongMaterial({ 
          color: 0x3b82f6, 
          wireframe: true,
          transparent: true,
          opacity: 0.8
      });
      const novaSphere = new THREE.Mesh(geometry, material);
      scene.add(novaSphere);

   
      const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      scene.add(core);


      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      camera.position.z = 5;

     
      function animate() {
          requestAnimationFrame(animate);

          novaSphere.rotation.x += 0.005;
          novaSphere.rotation.y += 0.005;
          
          
          const time = Date.now() * 0.001;
          const scale = 1 + Math.sin(time) * 0.1;
          core.scale.set(scale, scale, scale);

          renderer.render(scene, camera);
      }
      animate();

     
      window.addEventListener('resize', () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
      });
  }

  initThreeJS();



  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  let isListening = false;

  const synth = window.speechSynthesis;

  function speak(text) {
    if (synth.speaking) {
      console.error("speechSynthesis.speaking");
      return;
    }
    if (text !== "") {
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.onend = function (event) {
        console.log("SpeechSynthesisUtterance.onend");
      };
      utterThis.onerror = function (event) {
        console.error("SpeechSynthesisUtterance.onerror");
      };
      synth.speak(utterThis);
    }
  }

  function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.innerHTML = `<p>${text}</p>`;
    chatDisplay.appendChild(msgDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }

  async function processCommand(command) {
    addMessage(command, "user");

    try {
      const response = await fetch("/api/process_command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: command }),
      });

      const data = await response.json();
      addMessage(data.response, "system");
      speak(data.response);

      // Handle actions
      if (data.action === "show_products") {
        showSection("products");
      } else if (data.action === "book_appointment") {
        console.log("Booking appointment flow...");
      } else if (data.action === "make_call") {
          console.log("Initiating call...");
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage(
        "Sorry, I'm having trouble connecting to the server.",
        "system"
      );
      speak("Sorry, I'm having trouble connecting to the server.");
    }
  }


  micBtn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add("listening");
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove("listening");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("Recognized:", transcript);
    processCommand(transcript);
  };

  sendBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (text) {
      processCommand(text);
      textInput.value = "";
    }
  });

  textInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const text = textInput.value.trim();
      if (text) {
        processCommand(text);
        textInput.value = "";
      }
    }
  });

   // --- Navigation Logic ---
  function hideAllSections() {
      dashboardSection.classList.add("hidden");
      productsSection.classList.add("hidden");
      settingsSection.classList.add("hidden");
      
      // Also hide appointments if it's separate, but here we reused settings-panel class
      // Let's assume appointments-section is the ID
      const appointmentsSection = document.getElementById("appointments-section");
      if(appointmentsSection) appointmentsSection.classList.add("hidden");

      // Reset nav active states
      btnDashboard.classList.remove("active");
      btnProducts.classList.remove("active");
      btnSettings.classList.remove("active");
      btnAppointments.classList.remove("active");
  }

  function showSection(sectionName) {
      hideAllSections();
      if (sectionName === "dashboard") {
          dashboardSection.classList.remove("hidden");
          btnDashboard.classList.add("active");
      } else if (sectionName === "products") {
          productsSection.classList.remove("hidden");
          btnProducts.classList.add("active");
      } else if (sectionName === "settings") {
          settingsSection.classList.remove("hidden");
          btnSettings.classList.add("active");
      } else if (sectionName === "appointments") {
          const appointmentsSection = document.getElementById("appointments-section");
          if(appointmentsSection) appointmentsSection.classList.remove("hidden");
          btnAppointments.classList.add("active");
      }
  }

  btnDashboard.addEventListener("click", () => showSection("dashboard"));
  btnProducts.addEventListener("click", () => showSection("products"));
  btnSettings.addEventListener("click", () => showSection("settings"));
  btnAppointments.addEventListener("click", () => showSection("appointments"));
  
  // Back button in products
  if(btnBackProducts) {
      btnBackProducts.addEventListener("click", () => showSection("dashboard"));
  }

  btnCallSupport.addEventListener("click", () => {
    processCommand("call support");
  });

  // Appointment Form Submission
  const appointmentForm = document.getElementById("appointment-form");
  if(appointmentForm) {
      appointmentForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = document.getElementById("apt-name").value;
          const shoe = document.getElementById("apt-shoe").value;
          const date = document.getElementById("apt-date").value;
          
          // Mock submission
          alert(`Appointment Confirmed!\nName: ${name}\nShoe: ${shoe}\nDate: ${date}\n\nA confirmation email has been sent.`);
          showSection("dashboard");
          processCommand(`I just booked an appointment for ${shoe}`);
      });
  }
});
