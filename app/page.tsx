'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { submitRSVP } from './utils/rsvp';

// RSVP Modal Component
function RSVPModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [modalState, setModalState] = useState<'initial' | 'attending' | 'not-attending' | 'success' | 'error'>('initial');
  const [bgImageError, setBgImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    message: '',
  });

  // Track mounted state and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cleanup timeout if component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setModalState('initial');
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        message: '',
      });
      setErrorMessage('');
      setIsSubmitting(false);
      // Clear any existing timeout when modal opens
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMountedRef.current || isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await submitRSVP({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        message: formData.message,
        status: modalState === 'attending' ? 'attending' : 'not-attending',
      });

      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        setIsSubmitting(false);
        return;
      }

      if (response.success) {
        // Update state - React will batch these updates
        setIsSubmitting(false);
        setModalState('success');
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Navigate after showing success state
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            router.push('/wish-list');
          }
        }, 2000);
      } else {
        setIsSubmitting(false);
        setErrorMessage(response.error || 'Failed to submit RSVP');
        setModalState('error');
      }
    } catch (error) {
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        setIsSubmitting(false);
        return;
      }
      
      console.error('RSVP submission error:', error);
      setIsSubmitting(false);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setModalState('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal Background with couple's photo */}
      <div className="absolute inset-0">
        {!bgImageError ? (
          <Image
            src="/couple-background.jpg"
            alt="Couple Background"
            fill
            className="object-cover"
            quality={90}
            onError={() => setBgImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-black/50"></div>
        )}
        {/* Darker overlay for modal */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Modal Content */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-lg p-8 max-w-md w-full mx-4 shadow-xl border border-white/20">
        {modalState !== 'success' && (
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 text-amber-900 hover:text-amber-600 text-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        {modalState === 'initial' && (
          <div>
            <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              Will you be attending?
            </h2>
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => setModalState('attending')}
                className="px-6 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium"
              >
                I am coming
              </button>
              <button
                onClick={() => setModalState('not-attending')}
                className="px-6 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium"
              >
                I am not coming
              </button>
            </div>
          </div>
        )}

        {modalState === 'attending' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              We're excited to have you!
            </h2>
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                {errorMessage}
              </div>
            )}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-amber-900 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-amber-900/20 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 text-amber-900 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-amber-900 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-amber-900/20 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 text-amber-900 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-900 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-amber-900/20 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 text-amber-900 disabled:bg-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Become a Guest'}
            </button>
          </form>
        )}

        {modalState === 'not-attending' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              We'll miss you!
            </h2>
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
                {errorMessage}
              </div>
            )}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-amber-900 mb-1">
                Goodwill Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-amber-900/20 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 text-amber-900 disabled:bg-gray-100"
                placeholder="Share a message with us..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Send Message'}
            </button>
          </form>
        )}

        {modalState === 'success' && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">
              Thank you!
            </h2>
            <p className="text-amber-800">
              Your RSVP has been submitted successfully. We look forward to seeing you!
            </p>
            <p className="text-sm text-amber-700">
              Redirecting to wish list...
            </p>
          </div>
        )}

        {modalState === 'error' && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4 text-red-600">✕</div>
            <h2 className="text-2xl font-bold text-amber-900 mb-2">
              Submission Failed
            </h2>
            <p className="text-amber-800 mb-4">
              {errorMessage}
            </p>
            <button
              onClick={() => {
                setModalState('attending');
                setErrorMessage('');
                setIsSubmitting(false);
              }}
              className="w-full px-6 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [bgImageError, setBgImageError] = useState(false);
  const [herStoryImageError, setHerStoryImageError] = useState(false);
  const [hisStoryImageError, setHisStoryImageError] = useState(false);
  const [galleryImageErrors, setGalleryImageErrors] = useState<Set<number>>(new Set());

  // Handle hash-based scrolling on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  // Handle gallery image errors
  const handleGalleryImageError = (imageNumber: number) => {
    setGalleryImageErrors((prev) => new Set(prev).add(imageNumber));
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        {!bgImageError ? (
          <Image
            src="/couple-background.jpg"
            alt="Couple Background"
            fill
            className="object-cover"
            priority
            quality={90}
            onError={() => setBgImageError(true)}
          />
        ) : null}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>
      </div>
      
      {/* Content with relative positioning */}
      <div className="relative z-10">
      {/* Home Section */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Welcome to Our Wedding Celebration
          </h1>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            We're so excited to share this special day with you.
          </p>
        </div>
      </section>

      {/* Invitation Image & RSVP Section */}
      <section id="rsvp" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="text-center">
            {/* Wedding Invitation Card */}
            <div className="max-w-md mx-auto mb-8">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-lg bg-amber-50 border-2 border-amber-900/20">
                {!imageError ? (
                  <Image
                    src="/wedding-invitation.jpg.jpeg"
                    alt="Wedding Invitation Card"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, 448px"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-amber-700 text-sm mb-2">Please save your wedding invitation image as:</p>
                    <p className="text-amber-900 font-semibold">wedding-invitation.jpg.jpeg</p>
                    <p className="text-amber-700 text-xs mt-2">in the <code className="bg-amber-100 px-1 rounded">public</code> folder</p>
                    <p className="text-amber-600 text-xs mt-4">Supported formats: .jpg, .jpeg, .png, .webp</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* RSVP Button */}
            <button
              onClick={() => setIsRSVPModalOpen(true)}
              className="px-8 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors font-medium text-lg shadow-lg"
            >
              RSVP
            </button>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">Our Story</h1>
            <p className="text-lg text-amber-800 max-w-2xl mx-auto">
              The journey that brought us together
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-20">
            {/* Her Story Section */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Her Story Image */}
              <div className="w-full lg:w-1/2 lg:sticky lg:top-24">
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden shadow-lg bg-amber-50 border-2 border-amber-200">
                  {!herStoryImageError ? (
                    <Image
                      src="/herstory.jpeg"
                      alt="Her Story"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      onError={() => setHerStoryImageError(true)}
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                      <p className="text-amber-600 text-sm italic">Please add herstory.jpeg to the public folder</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Her Story Content */}
              <div className="w-full lg:w-1/2 space-y-6 text-amber-900">
                <h2 className="text-3xl font-bold text-amber-900 mb-4">Her Story</h2>
                <h3 className="text-2xl font-semibold text-amber-800 mb-4">
                  Finding My Forever Home: The Best Deal of My Life
                </h3>
                
                <p className="text-base leading-relaxed">
                  It started as just another high-pressure day at work. My boss had sent me out with a clear mission: find a client, close a sale, and don't come back empty-handed. I headed to the "Big 5" event, my mind purely on business, until I saw him. He was standing there—quiet, attentive, and carrying a presence that made the crowded room feel still.
                </p>

                <p className="text-base leading-relaxed">
                  What began as a professional pitch about real estate quickly turned into a beautiful twist of fate. I realized he wasn't just any prospect; he was the brother-in-law of my dear friend, Aisha. As he told me about his life—his move back from Cyprus and his dreams for the future—I found myself captivated not just by his brilliance, but by how easily I could talk to him. I teased him, saying that the only way to keep my attention was to become my client.
                </p>

                <p className="text-base leading-relaxed">
                  He didn't just buy the property; he chose to invest in us. The very next day, he closed the deal. But as we moved from the office to our first "tropical date," I realized the true irony of my job. I had spent my day trying to sell someone a piece of land, only to realize that I was the one who had finally found a home—not in a building, but in him. From the soft sands of the beach to a starlit dinner at Mud Lagos, everything felt perfectly aligned.
                </p>

                <p className="text-base leading-relaxed">
                  By our third day together, sitting by the ocean, he asked me to be his. I played hard to get, telling him I'd "think about it," but my heart had already signed the contract. That night, a wave of peace washed over me. I felt those unmistakable goosebumps, the kind that only come when God whispers, "This is the one." I didn't need to go home to think about it, because I was already there. The next morning, I said "yes" to the best deal I've ever made: a lifetime of love with my soulmate.
                </p>
              </div>
            </div>

            {/* His Story Section */}
            <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
              {/* His Story Image */}
              <div className="w-full lg:w-1/2 lg:sticky lg:top-24">
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden shadow-lg bg-amber-50 border-2 border-amber-200">
                  {!hisStoryImageError ? (
                    <Image
                      src="/hisstoy.jpeg"
                      alt="His Story"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      onError={() => setHisStoryImageError(true)}
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                      <p className="text-amber-600 text-sm italic">Please add hisstoy.jpeg to the public folder</p>
                    </div>
                  )}
                </div>
              </div>

              {/* His Story Content */}
              <div className="w-full lg:w-1/2 space-y-6 text-amber-900">
                <h2 className="text-3xl font-bold text-amber-900 mb-4">His Story</h2>
                <h3 className="text-2xl font-semibold text-amber-800 mb-4">
                  The Taste of Forever: Finding My Home in You
                </h3>
                
                <p className="text-base leading-relaxed">
                  I walked into that event with my mind on the future, recently back from Cyprus and looking for where to plant my roots in Nigeria. I wasn't looking for love; I was looking for an opportunity. Then I saw her. She was pitching me land with such passion and brilliance that I found myself captivated by the messenger more than the message. When I discovered she was a dear friend of my sister-in-law, Aisha, the coincidence felt like a sign.
                </p>

                <p className="text-base leading-relaxed">
                  I'll be honest. I started out thinking I would just "chop and go." I wanted a taste of the land she was selling, a quick business transaction to move my plans forward. She even teased me, saying I had to be her client to keep her attention, so I closed the deal the very next day. I thought I was just buying property, but that first "taste" of her spirit, her wit, and her heart got stuck in my taste buds. What I thought would be a brief encounter left a flavor of peace and joy that I knew I could never live without.
                </p>

                <p className="text-base leading-relaxed">
                  By our third day, as we sat by the ocean on our "tropical date," the business of land was far behind us. While I had purchased a piece of the earth to build on, I realized that she had become the sanctuary I was truly searching for. That night at the beach, I felt this wasn't just a moment, but a destiny.
                </p>

                <p className="text-base leading-relaxed">
                  I didn't just want a taste anymore; I wanted the whole lifetime. When she said "yes" to me the next morning, I knew I had made the most successful investment of my life. I didn't just buy land; I found the home I will cherish forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">Events</h1>
            <p className="text-lg text-amber-800 max-w-2xl mx-auto">
              Join us for our celebration
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="border border-amber-900/20 rounded-lg p-6 bg-white/80">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Engagement</h2>
              <div className="space-y-2">
                <p className="text-amber-800">
                  <span className="font-medium">Date:</span> May 2nd
                </p>
                <p className="text-amber-800">
                  <span className="font-medium">Time:</span> 12:00 PM
                </p>
                <p className="text-amber-800">
                  <span className="font-medium">Location:</span> HIS GRACE EVENT CENTER, beside Jubilee Baptist Church, Ring Road, Osogbo, Osun State
                </p>
              </div>
            </div>
            <div className="border border-amber-900/20 rounded-lg p-6 bg-white/80">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Reception</h2>
              <div className="space-y-2">
                <p className="text-amber-800">
                  <span className="font-medium">Date:</span> May 2nd
                </p>
                <p className="text-amber-800">
                  <span className="font-medium">Time:</span> 3:00 PM
                </p>
                <p className="text-amber-800">
                  <span className="font-medium">Location:</span> HIS GRACE EVENT CENTER, beside Jubilee Baptist Church, Ring Road, Osogbo, Osun State
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">Gallery</h1>
            <p className="text-lg text-amber-800 max-w-2xl mx-auto">
              Our favorite moments together
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 28 }, (_, i) => i + 1).map((imageNumber) => (
                <div
                  key={imageNumber}
                  className="aspect-square relative rounded-lg overflow-hidden shadow-md bg-amber-50 border border-amber-900/20 hover:shadow-lg transition-shadow"
                >
                  {!galleryImageErrors.has(imageNumber) ? (
                    <Image
                      src={`/PIC${imageNumber}.jpeg`}
                      alt={`Gallery Image ${imageNumber}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      loading="lazy"
                      onError={() => handleGalleryImageError(imageNumber)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                      <p className="text-amber-600 text-xs">
                        PIC{imageNumber}.jpeg
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">Contact Us</h1>
            <p className="text-lg text-amber-800 max-w-2xl mx-auto">
              Get in touch with us
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="border border-amber-900/20 rounded-lg p-8 space-y-6 bg-white/80">
              <div className="flex items-center gap-4">
                <span className="text-3xl" aria-hidden="true">📧</span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-amber-900 mb-1">Email</h2>
                  <a 
                    href="mailto:fasasi.jumat@gmail.com" 
                    className="text-amber-800 hover:text-amber-600 hover:underline transition-colors text-lg"
                  >
                    fasasi.jumat@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-3xl" aria-hidden="true">📞</span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-amber-900 mb-1">Phone</h2>
                  <a 
                    href="tel:+2349033141385" 
                    className="text-amber-800 hover:text-amber-600 hover:underline transition-colors text-lg"
                  >
                    +2349033141385
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-3xl" aria-hidden="true">💬</span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-amber-900 mb-1">WhatsApp</h2>
                  <a 
                    href="https://wa.me/2349033141385" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 hover:text-amber-600 hover:underline transition-colors text-lg"
                  >
                    +2349033141385
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Modal */}
      <RSVPModal 
        isOpen={isRSVPModalOpen} 
        onClose={() => {
          setIsRSVPModalOpen(false);
        }} 
      />
      </div>
    </div>
  );
}
