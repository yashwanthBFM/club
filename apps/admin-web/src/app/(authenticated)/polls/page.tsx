'use client';

import { useState, useEffect } from 'react';
import { Poll, getPolls, createPoll, deletePoll } from '@/services/polls';

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''],
  });

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const data = await getPolls();
      setPolls(data);
      setError(null);
    } catch (err) {
      setError('Failed to load polls');
      console.error('Error loading polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out empty options
      const validOptions = newPoll.options.filter(option => option.trim() !== '');
      if (validOptions.length < 2) {
        setError('Please provide at least 2 options');
        return;
      }

      await createPoll({
        title: newPoll.title,
        description: newPoll.description,
        options: validOptions,
      });
      setShowCreateModal(false);
      setNewPoll({ title: '', description: '', options: ['', ''] });
      loadPolls();
    } catch (err) {
      setError('Failed to create poll');
      console.error('Error creating poll:', err);
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    if (!confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    try {
      await deletePoll(pollId);
      loadPolls();
    } catch (err) {
      setError('Failed to delete poll');
      console.error('Error deleting poll:', err);
    }
  };

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const removeOption = (index: number) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Polls Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Poll
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => (
          <div key={poll.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">{poll.title}</h3>
            {poll.description && (
              <p className="text-gray-600 mb-4">{poll.description}</p>
            )}
            <div className="space-y-2 mb-4">
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center justify-between">
                  <span className="text-gray-700">{option.text}</span>
                  <span className="text-sm text-gray-500">
                    {option._count?.votes || 0} votes
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Total votes: {poll._count.votes}</span>
              <span>Created by: {poll.createdBy.name}</span>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleDeletePoll(poll.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Poll</h3>
              <form onSubmit={handleCreatePoll}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newPoll.description}
                    onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Options
                  </label>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 