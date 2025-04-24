import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// CONFIGURAZIONE FIREBASE (da sostituire con la tua)
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function Login({ onLogin }) {
  const [nome, setNome] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "sorriso" || password === "chevolo") {
      localStorage.setItem("nome", nome);
      localStorage.setItem("ruolo", password === "chevolo" ? "admin" : "user");
      onLogin();
    } else {
      alert("Password errata!");
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl mb-4">Benvenuto Clown!</h1>
      <input className="border p-2 mb-2" type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} /><br />
      <input className="border p-2 mb-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
      <button onClick={handleLogin} className="bg-red-500 text-white px-4 py-2 rounded">Entra</button>
    </div>
  );
}

function Dashboard() {
  const [eventi, setEventi] = useState([]);
  const nome = localStorage.getItem("nome");
  const ruolo = localStorage.getItem("ruolo");

  const caricaEventi = async () => {
    const querySnapshot = await getDocs(collection(db, "eventi"));
    const eventiList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEventi(eventiList);
  };

  useEffect(() => {
    caricaEventi();
  }, []);

  const prenota = async (evento) => {
    if (!evento.partecipanti.includes(nome)) {
      const eventoRef = doc(db, "eventi", evento.id);
      const nuoviPartecipanti = [...evento.partecipanti, nome];
      await updateDoc(eventoRef, { partecipanti: nuoviPartecipanti });
      caricaEventi();
    }
  };

  const eliminaEvento = async (id) => {
    await deleteDoc(doc(db, "eventi", id));
    caricaEventi();
  };

  const aggiungiEvento = async () => {
    const titolo = prompt("Titolo evento?");
    const luogo = prompt("Luogo?");
    const data = prompt("Data (es. 2025-04-25T15:00)?");
    if (titolo && luogo && data) {
      await addDoc(collection(db, "eventi"), {
        titolo,
        luogo,
        data,
        partecipanti: []
      });
      caricaEventi();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Ciao {nome}!</h2>
      {ruolo === "admin" && (
        <button onClick={aggiungiEvento} className="mb-4 bg-green-500 text-white px-4 py-2 rounded">Aggiungi Evento</button>
      )}
      {eventi.map((evento) => (
        <div key={evento.id} className="border p-4 mb-2">
          <h3 className="font-bold">{evento.titolo}</h3>
          <p><strong>Luogo:</strong> {evento.luogo}</p>
          <p><strong>Data:</strong> {new Date(evento.data).toLocaleString()}</p>
          <p><strong>Partecipanti:</strong> {evento.partecipanti.join(", ")}</p>
          {!evento.partecipanti.includes(nome) && (
            <button onClick={() => prenota(evento)} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">Partecipa</button>
          )}
          {ruolo === "admin" && (
            <button onClick={() => eliminaEvento(evento.id)} className="mt-2 ml-2 bg-red-400 text-white px-3 py-1 rounded">Elimina</button>
          )}
        </div>
      ))}
    </div>
  );
}

function App() {
  const nome = localStorage.getItem("nome");

  return (
    <Router>
      <Routes>
        <Route path="/" element={nome ? <Navigate to="/dashboard" /> : <Login onLogin={() => window.location.reload()} />} />
        <Route path="/dashboard" element={nome ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
