import {
    CalendarDays,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import Button from "../../components/Button/Button";
import "./ReportFilters.css";
import ReportHeader from "./ReportHeader";
function ReportFilters({
    fecha,
    onPrevious,
    onNext,
    onToday,
    disableNext = false,
}) {
    const fechaLarga = new Date(`${fecha}T12:00:00`).toLocaleDateString(
        "es-BO",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );

    const fechaCorta = new Date(`${fecha}T12:00:00`).toLocaleDateString(
        "es-BO",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
    return (
        <div className="report-filters">
            <ReportHeader />
            <div className="report-filters">
                <Button
                    onClick={onToday}
                >
                    Hoy
                </Button>
                <div className="report-filters__navigator">
                    <button
                        className="report-filters__arrow"
                        onClick={onPrevious}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div className="report-filters__date">
                        <CalendarDays size={18} />
                        <span className="report-filters__date-long">
                            {fechaLarga}
                        </span>
                        <span className="report-filters__date-short">
                            {fechaCorta}
                        </span>
                    </div>
                    <button
                        className="report-filters__arrow"
                        onClick={onNext}
                        disabled={disableNext}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
export default ReportFilters;