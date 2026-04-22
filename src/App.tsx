import { useState, useRef, type FormEvent } from 'react'
import { GoogleGenerativeAI, ChatSession} from '@google/generative-ai'
const API_KEY = import.meta.env.VITE_API_KEY;
interface Mensaje {
  autor: 'Usuario' | 'AstroBot' | 'Sistema';
  texto: string;
}

function App() {
const [mensajes, setMensajes] = useState<Mensaje[]>([]);
const [inputTexto, setInputTexto] = useState("");
const [cargando, setCargando] = useState(false);
  
const chatRef = useRef<ChatSession | null>(null);

  const iniciarChat = () => {
    if (!chatRef.current) {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const modelo = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: "Eres 'AstroBot', un astrofísico experto. Tu objetivo es enseñar astronomía de forma sencilla y apasionante. Si te preguntan de temas que no son del espacio, declina educadamente."
      });
      chatRef.current = modelo.startChat({ history: [] });
    }
    return chatRef.current;
  };

  const enviarMensaje = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputTexto.trim()) return;

    const nuevoMensajeUsuario: Mensaje = { autor: 'Usuario', texto: inputTexto };
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setInputTexto("");
    setCargando(true);

    try {
      const chat = iniciarChat();
      const resultado = await chat.sendMessage(nuevoMensajeUsuario.texto);
      
      const respuestaBot: Mensaje = { autor: 'AstroBot', texto: resultado.response.text() };
      setMensajes((prev) => [...prev, respuestaBot]);
    } catch (error) {
      console.error("Error al contactar con la base:", error);
      setMensajes((prev) => [...prev, { autor: 'Sistema', texto: 'Error de conexión galáctica.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div 
      className="h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Hubble_ultra_deep_field.jpg/1280px-Hubble_ultra_deep_field.jpg')" }}
    >
      
      <div className="h-full w-full bg-black/30">

        <div className="max-w-3xl mx-auto h-full p-4 flex flex-col text-slate-100 font-sans">
          
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500 text-center my-6 drop-shadow-lg">
            AstroBot
          </h1>
          
          <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 overflow-y-auto mb-6 shadow-2xl flex flex-col space-y-4">
            {mensajes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-300 animate-pulse text-lg drop-shadow-md">Inicia la transmisión estelar...</p>
              </div>
            ) : (
              mensajes.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.autor === 'Usuario' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-lg ${
                      msg.autor === 'Usuario' 
                        ? 'bg-blue-600/80 text-white rounded-br-none backdrop-blur-sm' 
                        : 'bg-slate-800/80 border border-slate-600/50 text-slate-200 rounded-bl-none backdrop-blur-sm'
                    }`}
                  >
                    <strong className="block mb-1 text-sm opacity-80">
                      {msg.autor === 'Usuario' ? 'Tú' : 'AstroBot'}
                    </strong>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.texto}</p>
                  </div>
                </div>
              ))
            )}

            {cargando && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg flex gap-2 items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={enviarMensaje} className="flex gap-3 mb-4">
            <input 
              type="text" 
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder="Pregúntame sobre agujeros negros, exoplanetas..." 
              className="flex-1 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl px-5 py-4 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-inner"
              disabled={cargando}
            />
            <button 
              type="submit" 
              disabled={cargando || !inputTexto.trim()} 
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800/80 disabled:text-slate-500 disabled:border-slate-700/50 disabled:border text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center backdrop-blur-sm"
            >
              Enviar
            </button>
          </form>
          
        </div>
      </div>
    </div>
  )
}

export default App