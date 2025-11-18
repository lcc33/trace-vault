import { Container, Icons, Wrapper } from "@/components";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { LampContainer } from "@/components/ui/lamp";
import SectionBadge from "@/components/ui/section-badge";
import { features, perks } from "@/constants";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import WaitlistForm from "@/components/waitlist";

const HomePage = () => {
  return (
    <section className="w-full relative flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-0 py-8">
      {/* hero */}
      <Wrapper>
        <div className="absolute inset-0 dark:bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10 h-[150vh]" />

        <Container>
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 h-full">
            {/* Intro badge */}
            <button className="group relative grid overflow-hidden rounded-full px-4 py-1 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200">
              <span>
                <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
              </span>
              <span className="backdrop absolute inset-[1px] rounded-full bg-neutral-950 transition-colors duration-200 group-hover:bg-neutral-900" />
              <span className="h-full w-full blur-md absolute bottom-0 inset-x-0 bg-gradient-to-tr from-primary/40"></span>
              <span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center justify-center gap-1.5">
                <Image
                  src="/icons/sparkles-dark.svg"
                  alt="✨"
                  width={24}
                  height={24}
                  className="w-4 h-4"
                />
                Introducing TraceVault
                <ChevronRight className="w-4 h-4" />
              </span>
            </button>

            {/* Headline */}
            <div className="flex flex-col items-center mt-6 sm:mt-8 max-w-3xl w-full text-center">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold bg-clip-text bg-gradient-to-b from-gray-50 to-gray-200 text-transparent leading-snug">
                Lost something? Found something?{" "}
                <br className="hidden sm:block" /> Reconnect with TraceVault
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-foreground/80 mt-4 sm:mt-6">
                A simple, open-source, community-driven lost & found platform.
                Report lost items, explore found listings, and reconnect with
                what matters.
              </p>

              {/* CTA */}
              <div className="">
                <Link
                  href="/sign-in"
                  className="flex flex-col sm:flex-row items-center justify-center mt-4 sm:mt-7 gap-4 w-full shadow-md "
                >
                  <Button
                    size="sm"
                    className="rounded-full p-5  bg-white/20 backdrop-blur-lg flex items-center"
                  >
                    ✨ Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative flex items-center justify-center py-8 sm:py-12 md:py-20 w-full">
              <div className="absolute top-1/2 left-1/2 -z-10 w-2/3 sm:w-3/4 h-2/3 sm:h-3/4 gradient -translate-x-1/2 -translate-y-1/2 blur-[6rem]" />
              <div className="rounded-xl p-2 sm:p-4 ring-1 ring-foreground/20 bg-opacity-50 backdrop-blur-xl">
                <Image
                  src="/assets/logo.jpeg"
                  alt="TraceVault logo"
                  width={1000}
                  height={1000}
                  className="rounded-lg shadow-2xl ring-1 ring-border"
                  priority
                />
                <BorderBeam size={200} duration={12} delay={9} />
              </div>
            </div>
          </div>
        </Container>
      </Wrapper>

      {/* Sections (How it works, Features, Pricing, Newsletter) */}
      {/* 👇 No major code changes, but improved spacing + responsive grids */}
      <Wrapper className="py-8 sm:py-12 lg:py-20">
        <Container>
          <div className="text-center max-w-lg mx-auto">
            <SectionBadge title="How It Works" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mt-4 sm:mt-6">
              Three simple steps to reconnect
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-4 sm:mt-6">
              TraceVault makes it easy to report, explore, and reconnect with
              your lost or found items.
            </p>
          </div>
        </Container>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="p-4 sm:p-6  rounded-lg bg-card shadow-sm hover:shadow-md transition"
              >
                <perk.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                <h3 className="text-lg font-medium mt-3">{perk.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  {perk.info}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Wrapper>

      {/* features */}
      <Wrapper className="flex flex-col items-center justify-center py-12 relative w-full">
        <div className="hidden md:block absolute top-0 -right-1/3 w-72 h-72 bg-primary rounded-full blur-[10rem] -z-10"></div>
        <div className="hidden md:block absolute bottom-0 -left-1/3 w-72 h-72 bg-indigo-600 rounded-full blur-[10rem] -z-10"></div>
        <Container>
          <div className="max-w-md mx-auto text-center px-4">
            <SectionBadge title="Features" />
            <h2 className="text-3xl lg:text-4xl font-semibold mt-6">
              Built for connection and trust
            </h2>
            <p className="text-muted-foreground mt-6">
              TraceVault gives you the tools to safely report, search, and
              recover lost items with ease.
            </p>
          </div>
        </Container>
        <Container>
          <div className="flex items-center justify-center mx-auto mt-8">
            {/* <Icons.feature className="w-auto h-80" /> */}
          </div>
        </Container>
        <Container>
          <div className="flex flex-col items-center justify-center py-10 md:py-20 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-8 px-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-start px-0 md:px-0"
                >
                  <div className="flex items-center justify-center"></div>
                  <h3 className="text-lg font-medium mt-4">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2 text-start">
                    {feature.info}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Wrapper>

      {/* pricing */}
      <Wrapper className="flex flex-col items-center justify-center py-12 relative w-full">
        <Container>
          <div className="max-w-md mx-auto text-center px-4">
            <SectionBadge title="Free Forever" />
            <h2 className="text-3xl lg:text-4xl font-semibold mt-6">
              No fees, no paywalls
            </h2>
            <p className="text-muted-foreground mt-6">
              TraceVault is free to use — because finding your things shouldn’t
              cost you anything.
            </p>
          </div>
        </Container>
      </Wrapper>

      {/* newsletter */}
      <Wrapper className="flex flex-col items-center justify-center py-12 relative w-full">
        <Container>
          <LampContainer>
            <div className="flex flex-col items-center justify-center relative w-full text-center px-4">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-semibold mt-8 leading-tight md:!leading-snug">
                Stay connected with TraceVault
              </h2>
              <p className="text-muted-foreground mt-6 max-w-md mx-auto">
                Get updates on new features, stories from the community, and
                tips to keep your belongings safe.
              </p>
            </div>
          </LampContainer>
        </Container>
        <Container className="relative z-[999999]">
          <div className="flex items-center justify-center w-full -mt-40">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-start md:justify-between w-full px-4 md:px-8 rounded-lg lg:rounded-2xl border border-border/80 py-4 md:py-8">
              <div className="flex flex-col items-start gap-4 w-full">
                <h4 className="text-xl md:text-2xl font-semibold">
                  Join the TraceVault Waitlist
                </h4>
                <p className="text-base text-muted-foreground">
                  Be the first to know when we launch.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:min-w-80 mt-5 md:mt-0 w-full md:w-max">
                <WaitlistForm />
                <p className="text-xs text-muted-foreground">
                  By joining, you agree to our{" "}
                  <Link href="/privacy">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Wrapper>
    </section>
  );
};

export default HomePage;
