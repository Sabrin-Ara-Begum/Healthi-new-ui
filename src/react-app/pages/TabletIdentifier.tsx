import { useRef, useState } from "react";
import Header from "@/react-app/components/Header";
import { Camera, Upload, ScanSearch, X } from "lucide-react";

interface Props {
  onNotificationClick: () => void;
}

export default function TabletIdentifier({
  onNotificationClick,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setImage(URL.createObjectURL(file));
  };

  return (
    <>
      <Header onNotificationClick={onNotificationClick} />

      <div className="flex-1 overflow-auto">

        <div className="max-w-6xl mx-auto px-10 py-8">

          <h1 className="text-4xl font-bold text-gray-800">
            💊 Tablet Identifier
          </h1>

          <p className="text-gray-500 mt-2">
            Upload or capture a medicine image to identify it using AI.
          </p>

          <div className="mt-8 bg-white rounded-3xl shadow-lg p-8">

            {!image ? (

<div className="border-2 border-dashed border-purple-300 rounded-3xl bg-gradient-to-br from-purple-50 to-white p-12">

<div className="flex flex-col items-center">

<div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center">

<ScanSearch className="w-20 h-20 text-purple-500"/>

</div>

<h2 className="text-3xl font-bold mt-8">
Identify Any Medicine
</h2>

<p className="text-gray-500 mt-3 text-center max-w-xl">
Upload a tablet, capsule, blister pack or medicine strip.
Our AI will identify it, explain its uses, dosage,
warnings and possible side effects.
</p>

<div className="flex flex-wrap justify-center gap-5 mt-10">

<button
onClick={() => fileInputRef.current?.click()}
className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition shadow-lg"
>

<Upload size={22}/>

Upload Image

</button>

<label className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 cursor-pointer transition shadow-lg">

<Camera size={22}/>

Capture Image

<input
hidden
type="file"
accept="image/*"
capture="environment"
onChange={(e)=>{
if(e.target.files?.length){
handleFile(e.target.files[0]);
}
}}
/>

</label>

</div>

<input
hidden
ref={fileInputRef}
type="file"
accept="image/*"
onChange={(e)=>{
if(e.target.files?.length){
handleFile(e.target.files[0]);
}
}}
/>

<div className="mt-10 text-gray-400 text-sm">

Supported:
PNG • JPG • JPEG

</div>

</div>

</div>

) : (

<div className="grid md:grid-cols-2 gap-10 items-center">

<div>

<img
src={image}
className="rounded-3xl shadow-xl border"
/>

</div>

<div>

<h2 className="text-3xl font-bold">

Image Ready ✅

</h2>

<p className="text-gray-500 mt-3">

The image has been uploaded successfully.

Click below to identify the medicine.

</p>

<div className="mt-8 flex flex-col gap-4">

<button
className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl py-4 text-lg font-semibold transition"
>

🔍 Analyze Medicine

</button>

<button
onClick={()=>setImage(null)}
className="border rounded-2xl py-4 hover:bg-gray-50 transition flex justify-center items-center gap-2"
>

<X size={20}/>

Choose Another Image

</button>

</div>

</div>

</div>

)}

          </div>

        </div>

      </div>
    </>
  );
}