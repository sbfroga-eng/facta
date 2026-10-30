import Die from "./Die";

export default function DiceShowcase() {
  return (
    <section className="dshow"><div className="w"><div className="inner">
      <div className="dstage"><Die size={178} spin="13s" dark /></div>
      <div>
        <span className="lab">PROBABILITY</span>
        <h3>마케팅은 <em>운</em>이 아닙니다.<br />확률을 설계하는 일입니다.</h3>
        <p>주사위는 던지는 순간 결과가 정해집니다. 하지만 어떤 면이 나올지는 바꿀 수 없죠.
          펙타는 주사위를 바꿉니다. 검색·AI·광고의 모든 접점에서 유리한 면이 나오도록
          데이터로 확률 자체를 재설계합니다.</p>
        <div className="dchips"><span>DATA</span><span>TIMING</span><span>SEARCH</span><span>AI CITATION</span><span>CONVERSION</span></div>
      </div>
    </div></div></section>
  );
}
