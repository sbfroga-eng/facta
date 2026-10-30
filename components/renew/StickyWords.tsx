import NoiseWall from "./NoiseWall";

export default function StickyWords() {
  return (
    <section className="sticky">
      <NoiseWall />
      <div className="stw w">
        <div className="stk"><b data-t="SEARCH">SEARCH</b></div>
        <div className="stk lm"><b data-t="GENERATIVE">GENERATIVE</b></div>
        <div className="stk"><b data-t="PERFORMANCE">PERFORMANCE</b></div>
      </div>
    </section>
  );
}
