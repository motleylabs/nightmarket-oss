import Head from "next/head";
import Icon from '../../../components/Icon'
import Link from "next/link";
import clsx from 'clsx';
import Button, { ButtonType } from "../../../components/Button";
import Launchpad, { MintOption } from "../../../components/Launchpad";
import { addDays } from "date-fns";

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
            <div className="align-self-start mb-10 lg:w-1/2 w-full flex flex-col gap-10">
                <img src={'/images/launchpad/motley-launchpad-nft.png'} alt={"launchpad image"} className="top-10 z-10 w-full rounded-lg object-cover"/>
                
            </div>
            <div className="top-20 w-full pt-0 lg:sticky lg:w-1/2 lg:pl-10 gap-6 flex flex-col mb-10">
                <h6 className="text-2xl font-bold">Mint phases</h6>
                {/* TODO: modify launchpad id system/props to match whatever integration needed */}
                <Launchpad launchpadId={"testLaunch"}>
                    <Launchpad.Finished title={"Founders mint"} price={2.5} minted={25} supply={25} mintType={MintOption.Standard} soldOut={true} soldOutTimeMilliseconds={200000}/>
                    <Launchpad.Active title={"Allowlist mint"} price={3} minted={100} supply={500} hasAccess={false} mintType={MintOption.Standard}/>
                    <Launchpad.Upcoming title={"Public mint"} price={3} supply={9000} isPublic={true} mintType={MintOption.Dynamic} mintDate={addDays(new Date(), 1)}/>
                </Launchpad>
            </div>
            <div className="align-self-start mb-10 md-pr-10 lg:w-1/2 flex flex-col gap-4 w-full">
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
        </main>
    )
}