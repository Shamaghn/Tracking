export default function PackageTimeline({ status }) {

  const steps = [
    { label: "En tránsito", icon: "📦" },
    { label: "En bodega", icon: "📍" },
    { label: "Entregado", icon: "✅" }
  ];

  const currentIndex = steps.findIndex(s => s.label === status);

  const progress = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div style={{ width: "100%" }}>

      <div className="position-relative mt-2 mb-3">

        {/* ✅ LINEA BASE */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: 0,
            width: "100%",
            height: "5px",
            background: "#ccc",
            borderRadius: "5px"
          }}
        ></div>

        {/* ✅ LINEA PROGRESO ANIMADA */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: 0,
            width: `${progress}%`,
            height: "5px",
            background: "#28a745",
            borderRadius: "5px",
            transition: "width 0.5s ease" // 🔥 animación
          }}
        ></div>

        {/* ✅ NODOS */}
        <div
          className="d-flex justify-content-between position-relative"
          style={{ zIndex: 2 }}
        >
          {steps.map((step, index) => {

            const isActive = index <= currentIndex;

            return (
              <div key={index} className="text-center">

                {/* 🔘 CÍRCULO */}
                <div
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    background: isActive ? "#28a745" : "#ccc",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    fontSize: "16px",
                    transition: "all 0.3s ease"
                  }}
                >
                  {step.icon}
                </div>

                {/* TEXTO */}
                <small
                  style={{
                    color: isActive ? "#28a745" : "#999",
                    fontWeight: isActive ? "bold" : "normal"
                  }}
                >
                  {step.label}
                </small>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
