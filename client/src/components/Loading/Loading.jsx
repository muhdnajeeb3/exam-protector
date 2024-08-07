import './Loading.css';

const Loading = ({message}) => {
  return (
    <div className="loading-overlay">
      <div className="lds-spinner">
        <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
      </div>
      {
        message && 

      <div>{message}</div>
      }
    </div>
  );
};

export default Loading;
