import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { Image } from '@heroui/react'

export default function BgMascot({
  url,
}: {
  url?: string;
}) {
  return (
    <div className='relative flex justify-center'>
      <div className='absolute -top-10 left-0 right-0 z-[-1] m-auto max-w-full grayscale-[1]'>
        <DotLottieReact
          src="https://cdn-fe.mesoor.com/chat/login-circle.json"
          loop
          autoplay
          className='relative left-1/2 h-full w-[1060px] -translate-x-1/2 opacity-20'
        />
      </div>
      <div className="relative flex justify-center">
        <Image src={url || 'https://cdn-fe.mesoor.com/chat/mascot.png'}
          alt="mascot"
          width={250}
          height={250}
          classNames={{
            img: '[mask-image:linear-gradient(to_bottom,transparent,black_0%,black_70%,transparent)]',
          }}
        />
      </div>
    </div>
  )
}
