export function Animation(): JSX.Element {
  return <div></div>;
}

function Leaves() {
  return (
    <div className="pointer-events-none absolute bottom-0 w-[350vw] sm:w-[200vw] md:w-[150vw] lg:w-[100vw]">
      <img src="/images/referrals/leaves.svg" alt="Background leaves" width={'100%'} />
    </div>
  );
}

Animation.Leaves = Leaves;
