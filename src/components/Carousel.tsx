import { Swiper, SwiperProps } from 'swiper/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'
import { Navigation } from 'swiper'
import { useRef, useState, useEffect } from 'react'

const useSwiperRef = <T extends HTMLElement>(): [T | null, React.Ref<T>] => {
  const [wrapper, setWrapper] = useState<T | null>(null)
  const ref = useRef<T>(null)

  useEffect(() => {
    if (ref.current) {
      setWrapper(ref.current)
    }
  }, [])

  return [wrapper, ref]
}

export default function Carousel({ children, ...other }: SwiperProps) {
  const [nextEl, nextElRef] = useSwiperRef<HTMLButtonElement>()
  const [prevEl, prevElRef] = useSwiperRef<HTMLButtonElement>()

  return (
    <div className="relative overflow-visible w-full">
      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl,
          nextEl,
        }}
        {...other}
      >
        {children}

      </Swiper>
      <button ref={prevElRef} className="absolute top-1/2 -left-7 -mt-7 z-10 w-14 h-14 flex items-center justify-center rounded-full bg-gray-900 shadow-2xl transition hover:scale-[1.02]">
          <ChevronLeftIcon color="#fff" width={24} />
        </button>
        <button ref={nextElRef} className="absolute top-1/2 -mt-7 -right-7 z-10 w-14 h-14 flex items-center justify-center rounded-full bg-gray-900 shadow-2xl  transition hover:scale-[1.02]">
          <ChevronRightIcon color="#fff" width={24} />
        </button>
    </div>
  )
}
