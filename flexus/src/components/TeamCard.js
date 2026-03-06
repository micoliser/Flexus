const TeamCard = ({ name, role, image, description }) => {
  return (
    <div className="team-card rounded-4 overflow-hidden position-relative">
      <div
        className="team-card-background"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="team-card-overlay"></div>
        <div className="team-card-content position-relative">
          <h3 className="fw-bold mb-2 text-white">{name}</h3>
          <p className="fs-5 fw-bold mb-3 text-brand-light">{role}</p>
          <p className="text-white fs-6 mb-0">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
