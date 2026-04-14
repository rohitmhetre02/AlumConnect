import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PublicMemories = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching memories from public API...')
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/public/memories`)
        const data = await response.json()
        
        console.log('📤 Memories API Response:', data)
        
        if (data.success && data.memories) {
          // Show only latest 4 memories
          const latestMemories = data.memories.slice(0, 4)
          setMemories(latestMemories)
          console.log(`✅ Loaded ${latestMemories.length} memories from database`)
          
          // Log each memory details
          latestMemories.forEach(memory => {
            console.log(`Memory: "${memory.title}"`)
            console.log(`  URL: ${memory.url}`)
            console.log(`  Description: ${memory.description || 'No description'}`)
            console.log('---')
          })
        } else {
          console.error('❌ API Error:', data.error || 'No memories found')
          setError(data.error || 'No memories found')
          setMemories([])
        }
      } catch (error) {
        console.error("❌ Error fetching memories:", error)
        setError(error.message)
        setMemories([])
      } finally {
        setLoading(false)
      }
    };

    fetchMemories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full">

      {/* HERO BANNER */}
      <div
        className="w-full py-20 text-center text-white"
        style={{
          backgroundImage: "url('/images/banner-pattern.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#7c1d1d"
        }}
      >
        <h1 className="text-5xl font-bold">Memories</h1>
        <p className="text-xl mt-4 opacity-90">Featured moments from our journey</p>
      </div>

      {/* MEMORIES GALLERY */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {memories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {memories.map((memory) => (
              <div
                key={memory._id}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedImage(memory)}
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={memory.url}
                    alt={memory.title || "Memory"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onLoad={() => {
                      console.log(`✅ Memory image loaded: ${memory.title}`, memory.url);
                    }}
                    onError={(e) => {
                      console.log(`❌ Memory image failed: ${memory.title}`, memory.url);
                      // Fallback to placeholder if image fails
                      e.target.src = `https://picsum.photos/seed/${memory._id}/400/400.jpg`;
                    }}
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold text-lg">
                      {memory.title || "Memory"}
                    </h3>
                    {memory.description && (
                      <p className="text-sm opacity-90 mt-1">
                        {memory.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error ? "Unable to Load Memories" : "No Memories Yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {error 
                ? "There was an error loading memories. Please try again later."
                : "Featured memories will appear here once they are added to the gallery."
              }
            </p>
          </div>
        )}

        {/* LOGIN TO VIEW MORE */}
        <div className="text-center mt-12">
          <Link
            to="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Login to View More Memories
          </Link>
        </div>

      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={selectedImage.url}
              alt={selectedImage.title || "Memory"}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onLoad={() => {
                console.log(`✅ Memory image loaded: ${selectedImage.title}`, selectedImage.url);
              }}
              onError={(e) => {
                console.log(`❌ Memory image failed: ${selectedImage.title}`, selectedImage.url);
                e.target.src = `https://picsum.photos/seed/${selectedImage._id}/800/600.jpg`;
              }}
            />
            
            {selectedImage.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-white text-xl font-semibold">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-white/90 mt-2">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicMemories;
