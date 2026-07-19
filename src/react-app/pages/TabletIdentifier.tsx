import { useState, useRef } from "react";
import { identifyMedicine } from "../api/tabletApi";
import Header from "@/react-app/components/Header";
import {
  Camera,
  Upload,
  ScanSearch,
  Trash2,
  Loader2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Pill,
  ShieldAlert,
  Search,
} from "lucide-react";

interface Props {
  onNotificationClick: () => void;
}

interface MedicineResult {
  medicine: string;
  generic: string;
  composition: string;
  uses: string[];
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  confidence: number;
}

export default function TabletIdentifier({
  onNotificationClick,
}: Props) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);

const streamRef = useRef<MediaStream | null>(null);

const [cameraOpen, setCameraOpen] = useState(false);

  const [dragging, setDragging] = useState(false);

  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<MedicineResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setSelectedFile(file);
  };

  const removeImage = () => {
    setPreview("");
    setResult(null);
  };
  const openCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },
    });

    streamRef.current = stream;

    setCameraOpen(true);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, 100);
  } catch (err) {
    alert("Unable to access camera.");
    console.error(err);
  }
};

const closeCamera = () => {
  streamRef.current?.getTracks().forEach((track) => track.stop());

  streamRef.current = null;

  setCameraOpen(false);
};

const takePhoto = () => {
  if (!videoRef.current || !canvasRef.current) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  ctx.drawImage(video, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;

    const file = new File([blob], "medicine.jpg", {
      type: "image/jpeg",
    });

    handleFile(file);

    closeCamera();
  }, "image/jpeg");
};

 const analyzeMedicine = async () => {
  if (!selectedFile) return;

  try {
    setLoading(true);

    const data = await identifyMedicine(selectedFile);

    console.log(data);

    setResult(data);

  } catch (err) {
    console.error(err);

    alert("Medicine identification failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Header
        onNotificationClick={onNotificationClick}
      />

      <div className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-white to-blue-50">

        <div className="max-w-7xl mx-auto px-8 py-10">{/* Hero */}

<div className="text-center mb-12">

<div className="inline-flex items-center gap-3 bg-purple-100 px-5 py-2 rounded-full">

<Pill className="w-5 h-5 text-purple-600"/>

<span className="font-semibold text-purple-700">
AI Powered Medicine Scanner
</span>

</div>

<h1 className="mt-6 text-5xl font-black text-gray-800">

Identify Medicines Instantly

</h1>

<p className="mt-5 text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">

Upload or capture a medicine image.

Our AI identifies the tablet, explains its uses,

dosage, side effects and safety warnings.

</p>

</div>



{/* Upload Card */}

{!preview && (

<div

onDragOver={(e)=>{

e.preventDefault();

setDragging(true);

}}

onDragLeave={()=>setDragging(false)}

onDrop={(e)=>{

e.preventDefault();

setDragging(false);

const file=e.dataTransfer.files[0];

if(file) handleFile(file);

}}

className={`

transition-all duration-300

rounded-[40px]

border-2

border-dashed

p-14

shadow-xl

${
dragging
?

"border-purple-500 bg-purple-50 scale-[1.02]"

:

"border-purple-200 bg-white"

}

`}

>

<div className="flex flex-col items-center">

<div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">

<ScanSearch className="w-20 h-20 text-white"/>

</div>

<h2 className="text-3xl font-bold mt-10">

Drag & Drop Medicine Image

</h2>

<p className="text-gray-500 mt-4 text-center max-w-lg">

Supported formats:

PNG • JPG • JPEG

Capture a tablet,

medicine strip,

or blister pack.

</p>

<div className="flex flex-wrap justify-center gap-5 mt-10">

<button

onClick={()=>uploadRef.current?.click()}

className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center gap-3 transition"

>

<Upload/>

Upload Image

</button>

<button
  onClick={openCamera}
  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-lg flex items-center gap-3 transition"
>
  <Camera />
  Capture
</button>

</div>

<input

hidden

ref={uploadRef}

type="file"

accept="image/*"

onChange={(e)=>{

const file=e.target.files?.[0];

if(file) handleFile(file);

}}

/>

</div>

</div>

)}
{preview && (

<div className="grid lg:grid-cols-2 gap-12 items-center">

{/* LEFT */}

<div className="bg-white rounded-[35px] p-6 shadow-2xl">

<img

src={preview}

alt="Medicine"

className="rounded-3xl w-full object-cover max-h-[550px]"

/>

</div>

{/* RIGHT */}

<div>

<div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">

<CheckCircle2 className="text-green-600 w-5 h-5"/>

<span className="font-semibold text-green-700">

Image Ready

</span>

</div>

<h2 className="text-4xl font-black mt-6">

Ready for AI Analysis

</h2>

<p className="mt-5 text-gray-500 leading-8">

Our AI will examine

✔ Tablet imprint

✔ Brand Name

✔ Composition

✔ Dosage

✔ Uses

✔ Side Effects

✔ Medical Warnings

</p>

<div className="mt-10 flex flex-col gap-5">

<button

onClick={analyzeMedicine}

disabled={loading}

className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl py-5 text-xl font-bold shadow-xl hover:scale-105 transition"

>

{loading ? (

<div className="flex justify-center items-center gap-3">

<Loader2 className="animate-spin"/>

Analyzing...

</div>

) : (

"🔍 Analyze Medicine"

)}

</button>

<button

onClick={removeImage}

className="border-2 border-gray-300 rounded-2xl py-4 hover:bg-gray-50 flex justify-center items-center gap-3"

>

<Trash2/>

Remove Image

</button>

</div>

</div>

</div>

)}
{/* ================= RESULT ================= */}

{result && (

<div className="mt-14">

<div className="bg-white rounded-[40px] shadow-2xl p-10">

<div className="flex justify-between items-center flex-wrap gap-6">

<div>

<div className="inline-flex items-center gap-3">

<Pill className="w-10 h-10 text-purple-600"/>

<div>

<h2 className="text-4xl font-black">

{result.medicine}

</h2>

<p className="text-gray-500 mt-1">

{result.generic}

</p>

</div>

</div>

</div>

<div className="text-center">

<div className="text-5xl font-black text-purple-600">

{result.confidence}%

</div>

<p className="text-gray-500">

Confidence

</p>

</div>

</div>

<hr className="my-10"/>

<div className="grid lg:grid-cols-2 gap-8">

{/* USES */}

<div className="rounded-3xl bg-green-50 p-6">

<h3 className="text-2xl font-bold mb-5">

✅ Uses

</h3>

<div className="space-y-3">

{result.uses.map((item,index)=>(

<div
key={index}
className="flex items-center gap-3"
>

<CheckCircle2 className="text-green-600"/>

<span>{item}</span>

</div>

))}

</div>

</div>

{/* SIDE EFFECTS */}

<div className="rounded-3xl bg-red-50 p-6">

<h3 className="text-2xl font-bold mb-5">

⚠ Side Effects

</h3>

<div className="space-y-3">

{result.sideEffects.map((item,index)=>(

<div
key={index}
className="flex items-center gap-3"
>

<AlertTriangle className="text-red-500"/>

<span>{item}</span>

</div>

))}

</div>

</div>

{/* DOSAGE */}

<div className="rounded-3xl bg-blue-50 p-6">

<h3 className="text-2xl font-bold mb-5">

💊 Dosage

</h3>

<p className="leading-8">

{result.dosage}

</p>

</div>

{/* WARNINGS */}

<div className="rounded-3xl bg-yellow-50 p-6">

<h3 className="text-2xl font-bold mb-5">

🛡 Warnings

</h3>

<div className="space-y-3">

{result.warnings.map((item,index)=>(

<div
key={index}
className="flex items-center gap-3"
>

<ShieldAlert className="text-yellow-600"/>

<span>{item}</span>

</div>

))}

</div>

</div>

</div>

<div className="mt-10 rounded-3xl bg-purple-50 p-6">

<h3 className="text-xl font-bold mb-3">

Composition

</h3>

<p>

{result.composition}

</p>

</div>

<div className="grid md:grid-cols-3 gap-5 mt-10">

<a

href={`https://www.google.com/search?q=${result.medicine}`}

target="_blank"

className="bg-blue-500 text-white rounded-2xl py-4 flex justify-center items-center gap-3 hover:bg-blue-600 transition"

>

<Search/>

Google Search

</a>

<a

href={`https://www.google.com/maps/search/pharmacy+near+me`}

target="_blank"

className="bg-green-500 text-white rounded-2xl py-4 flex justify-center items-center gap-3 hover:bg-green-600 transition"

>

<MapPin/>

Nearby Pharmacy

</a>

<button

onClick={removeImage}

className="bg-purple-500 text-white rounded-2xl py-4 hover:bg-purple-600 transition"

>

Scan Another

</button>

</div>

</div>

</div>

)}
{cameraOpen && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-white rounded-[35px] p-8 w-[90%] max-w-2xl">

      <h2 className="text-3xl font-bold text-center mb-6">
        Capture Medicine
      </h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-3xl w-full"
      />

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      <div className="flex justify-center gap-5 mt-8">

        <button
          onClick={takePhoto}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold"
        >
          📸 Take Photo
        </button>

        <button
          onClick={closeCamera}
          className="border px-8 py-4 rounded-2xl"
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}
        </div>
      </div>
    </>
  );
}