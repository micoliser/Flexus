const CardR = ({ icon, title, description }) => {
  return (
    <div className="col-12 col-md-6 col-lg-3">
      <div className="why-choose-item">
        <i className={`bi ${icon} display-4 mb-3 d-block`}></i>
        <h5 className="fw-bold mb-2">{title}</h5>
        <p className="small mb-0">{description}</p>
      </div>
    </div>
  );
};

export default CardR;
