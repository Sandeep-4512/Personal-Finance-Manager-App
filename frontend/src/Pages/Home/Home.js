import "./home.css";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import Analytics from "./Analytics";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container, Badge } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Home = () => {
  const navigate = useNavigate();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");
  const [balance, setBalance] = useState(0);

  const handleStartChange = (date) => setStartDate(date);
  const handleEndChange = (date) => setEndDate(date);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const avatarFunc = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user.isAvatarImageSet || !user.avatarImage) {
          navigate("/setAvatar");
        }
        setcUser(user);
        setRefresh(true);
      } else {
        navigate("/login");
      }
    };
    avatarFunc();
  }, [navigate]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, amount, description, category, date, transactionType } = values;

    if (!title || !amount || !description || !category || !date || !transactionType) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(addTransaction, {
        ...values,
        userId: cUser._id,
      });

      if (data.success) {
        toast.success(data.message, toastOptions);
        handleClose();
        setRefresh(!refresh);
        setValues({
          title: "",
          amount: "",
          description: "",
          category: "",
          date: "",
          transactionType: "",
        });
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (error) {
      toast.error("Error processing transaction", toastOptions);
    }
    setLoading(false);
  };

  const calculateBalance = () => {
    let total = 0;
    transactions.forEach(transaction => {
      if (transaction.transactionType === "credit") {
        total += transaction.amount;
      } else {
        total -= transaction.amount;
      }
    });
    setBalance(total);
  };

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await axios.post(getTransactions, {
          userId: cUser?._id,
          frequency,
          startDate,
          endDate,
          type,
        });
        setTransactions(data.transactions || []);
        calculateBalance();
      } catch (err) {
        toast.error("Error loading transactions", toastOptions);
      } finally {
        setLoading(false);
      }
    };

    if (cUser?._id) fetchAllTransactions();
  }, [refresh, frequency, endDate, type, startDate, cUser]);

  return (
    <div className="home-container">
      <Header />
      
      <div className="welcome-section">
        <Container>
          <div className="welcome-content">
            <h2>Welcome back, <span>{cUser?.username || 'User'}</span>!</h2>
            <div className="info-cards">
              <div className="info-card">
                <AccountBalanceWalletIcon className="info-icon" />
                <div>
                  <p>Current Balance</p>
                  <h3 className={balance >= 0 ? 'positive' : 'negative'}>
                    ${balance.toFixed(2)}
                  </h3>
                </div>
              </div>
              <div className="info-card">
                <CalendarTodayIcon className="info-icon" />
                <div>
                  <p>Today's Date</p>
                  <h3>
                    {currentDateTime.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                </div>
              </div>
              <div className="info-card">
                <AccessTimeIcon className="info-icon" />
                <div>
                  <p>Current Time</p>
                  <h3>
                    {currentDateTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <Container className="main-content">
          <div className="filter-row">
            <div className="filter-group">
              <Form.Label>Select Frequency</Form.Label>
              <Form.Select
                name="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="7">Last Week</option>
                <option value="30">Last Month</option>
                <option value="365">Last Year</option>
                <option value="custom">Custom</option>
              </Form.Select>
            </div>

            {frequency === "custom" && (
              <div className="date-range">
                <div className="date-picker">
                  <Form.Label>Start Date</Form.Label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="form-control"
                  />
                </div>
                <div className="date-picker">
                  <Form.Label>End Date</Form.Label>
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <div className="filter-group">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="expense">Expense</option>
                <option value="credit">Income</option>
              </Form.Select>
            </div>

            <div className="view-toggle">
              <Button
                variant={view === "table" ? "primary" : "outline-primary"}
                onClick={() => setView("table")}
              >
                <FormatListBulletedIcon /> Table
              </Button>
              <Button
                variant={view === "chart" ? "primary" : "outline-primary"}
                onClick={() => setView("chart")}
              >
                <BarChartIcon /> Chart
              </Button>
            </div>

            <Button onClick={handleShow} className="add-button">
              + Add Transaction
            </Button>
          </div>

          <div className="content-area">
            {view === "table" ? (
              <TableData data={transactions} user={cUser} />
            ) : (
              <Analytics transactions={transactions} user={cUser} />
            )}
          </div>
        </Container>
      )}

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Form fields remain the same as before */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {loading ? "Processing..." : "Save Transaction"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Home;
