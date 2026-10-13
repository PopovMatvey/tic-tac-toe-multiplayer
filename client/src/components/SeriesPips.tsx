import { Mark } from '../model/types';

export function SeriesPips({ wins, mark }: { wins: number; mark: Mark }) {
  return (
    <div className={`pips pips-${mark.toLowerCase()}`} aria-label={`Побед: ${wins} из 3`}>
      {[0, 1, 2].map((index) => (
        <span key={index} className={index < wins ? 'pip on' : 'pip'} />
      ))}
    </div>
  );
}
