const colorMap = {
  blue:'b-bl', green:'b-gr', orange:'b-or', red:'b-rd',
  purple:'b-pu', cyan:'b-cy', pink:'b-pk', gray:'b-gy'
};
export default function Badge({ color='gray', children }) {
  return <span className={`bdg ${colorMap[color]||'b-gy'}`}>{children}</span>;
}
