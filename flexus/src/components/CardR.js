const CardR = ({ icon, title, description }) => {
  return (
    <div className="card-r col-12 col-md-6 col-lg-3 shadow-sm rounded-4 p-4 h-100 text-center">
      <div className="why-choose-item">
        <i className={`bi ${icon} display-4 mb-3 d-block`}></i>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="small mb-0">{description}</p>
      </div>
    </div>
  );
};

export default CardR;
