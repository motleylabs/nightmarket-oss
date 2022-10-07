import Head from "next/head";
import Icon from '../../../components/Icon'
import Link from "next/link";

const testPreview = [
    {
        image: "/images/launchpad/motley-1.png"
    },
    {
        image: "/images/launchpad/motley-2.png"
    },
    {
        image: "/images/launchpad/motley-3.png"
    },
    ,{
        image: "/images/launchpad/motley-4.png"
    }
    ,{
        image: "/images/launchpad/motley-5.png"
    }
    ,{
        image: "/images/launchpad/motley-1.png"
    }
    ,{
        image: "/images/launchpad/motley-2.png"
    }
    ,{
        image: "/images/launchpad/motley-3.png"
    }
    ,{
        image: "/images/launchpad/motley-4.png"
    }
    ,{
        image: "/images/launchpad/motley-5.png"
    },
    {
        image: "/images/launchpad/motley-1.png"
    },
    {
        image: "/images/launchpad/motley-2.png"
    }
]

export default function LaunchpadPage() {
    return (
        <main className="relative mx-auto mt-8 flex max-w-7xl flex-wrap justify-start px-4 pb-4 md:mt-12 md:px-8 md:pb-8">
            <Head>
                <title>{"Launchpad test"}</title>
                <meta name="description" content="Launchpad test description"></meta>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="align-self-start mb-10 lg:w-1/2 flex flex-col gap-10">
                <img src={'/images/launchpad/motley-launchpad-nft.png'} alt={"launchpad image"} className="top-10 z-10 w-full rounded-lg object-cover"/>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-4 justify-between items-center">
                        <h4 className="text-3xl font-bold">Team Motley</h4>
                        <div className="flex flex-row gap-2 items-center text-[#A8A8A8]">
                            <Link href={"https://twitter.com/holaplex"}>
                                <a target="_blank" className="hover:scale-105 transform ease-in-out">
                                    <Icon.Twitter/>
                                </a>
                            </Link>                            
                            <Link href={"https://discord.gg/holaplex"}>
                                <a target="_blank" className="hover:scale-105 transform ease-in-out">
                                    <Icon.Discord/>
                                </a>
                            </Link>
                        </div>
                    </div>
                    <p className="text-base text-gray-300">This is a test description of a launchpad project for Motley Labs.</p>
                    <div className="flex flex-row gap-4">
                        <div className="rounded-lg bg-gray-800 p-4 flex flex-col">
                            <p className="text-xs text-gray-300">Total supply</p>
                            <h6 className="text-white font-bold text-lg">10,000</h6>
                        </div>
                        <div className="rounded-lg bg-gray-800 p-4 flex flex-col">
                            <p className="text-xs text-gray-300">Mint date</p>
                            <h6 className="text-white font-bold text-lg">10/24/2022</h6>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <h6 className="text-2xl font-bold">Preview</h6>
                    <div className="grid grid-cols-6 gap-4">
                        {testPreview.map((previewItem, i) => (
                            <img src={previewItem?.image} alt={`preview-image-${i}`} className="rounded-lg object-cover"/>
                        ))}
                    </div>
                </div>
            </div>
            <div className="top-10 w-full pt-0 lg:sticky lg:w-1/2 lg:pl-10 flex flex-col gap-6">
                <h6 className="text-2xl font-bold">Mint phases</h6>
                {/* TODO: make into a component that contains minting logic */}
                <div className="flex flex-col justify-between rounded-lg border-2 border-primary-700 p-4 bg-gray-900">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-row gap-2 items-center">
                            <div className="rounded-full w-2 h-2 bg-primary-700"/>
                            <p className="text-xs text-gray-300 font-semibold"> You are not on the allowlist</p>
                        </div>
                        <div className="text-xl text-white font-bold flex flex-row justify-between">
                            <h6>Allowlist mint</h6>
                            <p><span className="text-xs text-gray-300 font-normal">Price</span> 3 SOL</p>
                        </div>
                        <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-gray-300 font-normal">Minting</p>
                                <div className="flex flex-row gap-2 items-center">
                                    <p className="text-base font-bold">103/500</p>
                                    <div className="rounded-full w-32 bg-gray-700 h-2">
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}